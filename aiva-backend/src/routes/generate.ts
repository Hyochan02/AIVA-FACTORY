/**
 * 음악 생성 라우트: /api/generate
 * POST /                    - Suno AI 음악 생성 요청
 * GET  /:trackId/status     - 생성 상태 폴링 (3초 간격 권장)
 * DELETE /:trackId          - 생성 취소 + 크레딧 환불
 */
import { Router } from 'express'
import { z } from 'zod'
import axios from 'axios'
import { authenticate } from '../middlewares/auth'
import { pool } from '../config/database'
import { v4 as uuidv4 } from 'uuid'
import rateLimit from 'express-rate-limit'

const router = Router()
router.use(authenticate)

// ── 상수 ────────────────────────────────────────────────────
const CREDIT_COST    = 4
const SUNO_BASE      = () => process.env.SUNO_API_BASE_URL || 'https://api.sunoapi.org'
const SUNO_HEADERS   = () => ({ Authorization: `Bearer ${process.env.SUNO_API_KEY}` })
const CALLBACK_BASE  = () => process.env.API_BASE_URL || 'https://api.aiva-factory.p-e.kr'

// 생성 API 전용 Rate Limit
const generateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  keyGenerator: (req) => req.user!.id,
  message: { success: false, error: '너무 많은 생성 요청입니다. 1분 후 다시 시도해주세요.', code: 'RATE_LIMITED' },
})

const generateSchema = z.object({
  prompt:       z.string().min(1).max(500),
  genre:        z.string().optional(),
  mood:         z.string().optional(),
  instruments:  z.array(z.string()).optional(),
  bpm:          z.number().min(60).max(200).optional(),
  duration:     z.number().min(30).max(240).default(120),
  instrumental: z.boolean().default(false),
  title:        z.string().max(80).optional(),
  isPublic:     z.boolean().default(true),
})

// ── POST /api/generate ──────────────────────────────────────
router.post('/', generateLimiter, async (req, res, next) => {
  try {
    const body = generateSchema.parse(req.body)
    const conn = await pool.getConnection()
    try {
      // 1. 크레딧 확인
      const [creditRows] = await conn.query(
        'SELECT balance FROM credit_history WHERE user_id = ? ORDER BY created_at DESC LIMIT 1',
        [req.user!.id]
      )
      const balance = ((creditRows as Record<string, unknown>[])[0]?.balance as number) ?? 0
      if (balance < CREDIT_COST) {
        res.status(402).json({ success: false, error: '크레딧이 부족합니다.', code: 'INSUFFICIENT_CREDITS' })
        return
      }

      // 2. 트랙 레코드 생성 (pending)
      const trackId = uuidv4()
      const trackTitle = body.title || body.prompt.slice(0, 50)
      await conn.query(
        `INSERT INTO tracks (id, user_id, title, prompt, genre, mood, bpm, duration, status, is_public)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?)`,
        [trackId, req.user!.id, trackTitle, body.prompt,
         body.genre ?? null, body.mood ?? null, body.bpm ?? null, body.duration, body.isPublic ? 1 : 0]
      )

      // 3. Suno API v1 호출
      const styleTags = [body.genre, body.mood, ...(body.instruments ?? [])].filter(Boolean).join(', ')
      let sunoTaskId: string | null = null

      if (process.env.SUNO_API_KEY) {
        const sunoRes = await axios.post(
          `${SUNO_BASE()}/api/v1/generate`,
          {
            prompt:       body.prompt,
            style:        styleTags || body.genre || 'pop',
            title:        trackTitle,
            customMode:   true,
            instrumental: body.instrumental,
            model:        'V4_5ALL',
            callBackUrl:  `${CALLBACK_BASE()}/api/generate/callback`,
          },
          { headers: SUNO_HEADERS(), timeout: 20000 }
        )
        sunoTaskId = sunoRes.data?.data?.taskId ?? null
        if (!sunoTaskId) {
          await conn.query("UPDATE tracks SET status = 'error' WHERE id = ?", [trackId])
          res.status(503).json({ success: false, error: 'Suno AI 작업 ID를 받지 못했습니다.', code: 'SUNO_NO_TASK_ID' })
          return
        }
      } else {
        // 개발 모드: mock taskId
        sunoTaskId = `mock_${Date.now()}_${trackId.slice(0, 8)}`
      }

      // 4. task_id 저장, status → generating
      await conn.query(
        "UPDATE tracks SET suno_task_id = ?, status = 'generating' WHERE id = ?",
        [sunoTaskId, trackId]
      )

      // 5. 크레딧 차감
      const newBalance = balance - CREDIT_COST
      await conn.query(
        `INSERT INTO credit_history (id, user_id, type, amount, balance, description, track_id)
         VALUES (?, ?, 'usage', ?, ?, '음악 생성', ?)`,
        [uuidv4(), req.user!.id, -CREDIT_COST, newBalance, trackId]
      )

      res.status(202).json({
        success: true,
        data: {
          taskId:           sunoTaskId,
          trackId,
          estimatedSeconds: 30,
          creditsUsed:      CREDIT_COST,
          creditsRemaining: newBalance,
        },
      })
    } finally { conn.release() }
  } catch (err) { next(err) }
})

// ── GET /api/generate/:trackId/status ──────────────────────
router.get('/:trackId/status', async (req, res, next) => {
  try {
    const conn = await pool.getConnection()
    try {
      const [rows] = await conn.query(
        'SELECT * FROM tracks WHERE id = ? AND user_id = ?',
        [req.params.trackId, req.user!.id]
      )
      const track = (rows as Record<string, unknown>[])[0]
      if (!track) {
        res.status(404).json({ success: false, error: '트랙을 찾을 수 없습니다.' })
        return
      }

      // 이미 완료된 경우 바로 반환
      if (track.status === 'done') {
        const [vRows] = await conn.query(
          'SELECT * FROM track_versions WHERE track_id = ? ORDER BY version_num',
          [track.id]
        )
        res.json({
          success: true,
          data: {
            trackId:  track.id,
            status:   'done',
            progress: 100,
            step:     '완료',
            audioUrl: track.audio_url,
            versions: vRows,
          },
        })
        return
      }

      if (track.status === 'error') {
        res.json({ success: true, data: { trackId: track.id, status: 'error', progress: 0, step: '오류 발생' } })
        return
      }

      // Suno API 실제 상태 조회
      let progress = 10
      let status   = track.status as string
      let versions: unknown[] = []

      if (process.env.SUNO_API_KEY && track.suno_task_id) {
        const sunoRes = await axios.get(
          `${SUNO_BASE()}/api/v1/generate/record-info?taskId=${track.suno_task_id}`,
          { headers: SUNO_HEADERS(), timeout: 10000 }
        )
        const sunoStatus: string = sunoRes.data?.data?.status ?? 'PENDING'

        const progressMap: Record<string, number> = {
          PENDING:               15,
          TEXT_SUCCESS:          35,
          FIRST_SUCCESS:         65,
          SUCCESS:              100,
          CREATE_TASK_FAILED:     0,
          GENERATE_AUDIO_FAILED:  0,
        }
        const stepMap: Record<string, string> = {
          PENDING:              '요청 접수 중',
          TEXT_SUCCESS:         '가사·구조 생성 완료',
          FIRST_SUCCESS:        '첫 번째 버전 준비 중',
          SUCCESS:              '완료',
          CREATE_TASK_FAILED:   '작업 생성 실패',
          GENERATE_AUDIO_FAILED:'오디오 생성 실패',
        }

        progress = progressMap[sunoStatus] ?? 50

        if (sunoStatus === 'SUCCESS') {
          status = 'done'
          const sunoData: Array<{
            id: string
            audioUrl: string
            streamAudioUrl: string
            imageUrl: string
            title: string
            tags: string
            duration: number
          }> = sunoRes.data.data.response?.sunoData ?? []

          // 두 버전 모두 track_versions에 저장
          for (let i = 0; i < sunoData.length; i++) {
            const sd = sunoData[i]
            const vId = uuidv4()
            await conn.query(
              `INSERT INTO track_versions
                 (id, track_id, version_num, suno_audio_id, audio_url, stream_url, image_url, title, duration)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
               ON DUPLICATE KEY UPDATE
                 audio_url = VALUES(audio_url), stream_url = VALUES(stream_url)`,
              [vId, track.id, i + 1, sd.id, sd.audioUrl, sd.streamAudioUrl,
               sd.imageUrl, sd.title || track.title, Math.round(sd.duration ?? 0)]
            )
          }

          // 메인 트랙에 첫 번째 버전 URL 저장
          const first = sunoData[0]
          if (first) {
            await conn.query(
              "UPDATE tracks SET status = 'done', audio_url = ?, cover_url = ?, duration = ? WHERE id = ?",
              [first.audioUrl, first.imageUrl, Math.round(first.duration ?? 0), track.id]
            )
          }

          const [vRows] = await conn.query(
            'SELECT * FROM track_versions WHERE track_id = ? ORDER BY version_num',
            [track.id]
          )
          versions = vRows as unknown[]

        } else if (sunoStatus === 'CREATE_TASK_FAILED' || sunoStatus === 'GENERATE_AUDIO_FAILED') {
          status = 'error'
          await conn.query("UPDATE tracks SET status = 'error' WHERE id = ?", [track.id])
        } else {
          // 상태 업데이트
          await conn.query("UPDATE tracks SET status = 'generating' WHERE id = ?", [track.id])
        }

        res.json({
          success: true,
          data: {
            trackId:  track.id,
            status,
            progress,
            step:     stepMap[sunoStatus] ?? '처리 중',
            audioUrl: status === 'done' ? (versions as Array<{ audio_url: string }>)[0]?.audio_url : null,
            versions: status === 'done' ? versions : [],
          },
        })
      } else {
        // 개발 모드: 시간 경과에 따른 시뮬레이션
        const elapsed = Date.now() - new Date(track.created_at as string).getTime()
        progress = Math.min(Math.floor((elapsed / 1000) * 3), 99)

        if (progress >= 99) {
          status = 'done'
          progress = 100
          // 개발용 mock 오디오 URL
          await conn.query(
            "UPDATE tracks SET status = 'done', audio_url = ? WHERE id = ?",
            ['https://example.com/mock-audio.mp3', track.id]
          )
        }

        res.json({
          success: true,
          data: {
            trackId:  track.id,
            status,
            progress,
            step:     status === 'done' ? '완료' : '오디오 합성 중 (개발 모드)',
            audioUrl: status === 'done' ? 'https://example.com/mock-audio.mp3' : null,
            versions: [],
          },
        })
      }
    } finally { conn.release() }
  } catch (err) { next(err) }
})

// ── POST /api/generate/callback  (Suno → 우리 서버) ────────
// callBackUrl 로 Suno 가 결과를 push 해주는 엔드포인트 (인증 불필요)
router.post('/callback', async (req, res) => {
  try {
    const { data } = req.body
    if (!data?.taskId) { res.json({ ok: true }); return }

    const conn = await pool.getConnection()
    try {
      const [rows] = await conn.query(
        "SELECT * FROM tracks WHERE suno_task_id = ? AND status = 'generating'",
        [data.taskId]
      )
      const track = (rows as Record<string, unknown>[])[0]
      if (!track) { res.json({ ok: true }); return }

      const sunoData: Array<{
        id: string; audioUrl: string; streamAudioUrl: string
        imageUrl: string; title: string; duration: number
      }> = data.response?.sunoData ?? []

      for (let i = 0; i < sunoData.length; i++) {
        const sd = sunoData[i]
        await conn.query(
          `INSERT INTO track_versions
             (id, track_id, version_num, suno_audio_id, audio_url, stream_url, image_url, title, duration)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
           ON DUPLICATE KEY UPDATE audio_url = VALUES(audio_url)`,
          [uuidv4(), track.id, i + 1, sd.id, sd.audioUrl, sd.streamAudioUrl,
           sd.imageUrl, sd.title, Math.round(sd.duration ?? 0)]
        )
      }

      const first = sunoData[0]
      if (first) {
        await conn.query(
          "UPDATE tracks SET status = 'done', audio_url = ?, cover_url = ?, duration = ? WHERE id = ?",
          [first.audioUrl, first.imageUrl, Math.round(first.duration ?? 0), track.id]
        )
      }
    } finally { conn.release() }
    res.json({ ok: true })
  } catch { res.json({ ok: true }) }
})

// ── DELETE /api/generate/:trackId ──────────────────────────
router.delete('/:trackId', async (req, res, next) => {
  try {
    const conn = await pool.getConnection()
    try {
      const [rows] = await conn.query(
        "SELECT * FROM tracks WHERE id = ? AND user_id = ? AND status IN ('pending','generating')",
        [req.params.trackId, req.user!.id]
      )
      const track = (rows as Record<string, unknown>[])[0]
      if (track) {
        const [creditRows] = await conn.query(
          'SELECT balance FROM credit_history WHERE user_id = ? ORDER BY created_at DESC LIMIT 1',
          [req.user!.id]
        )
        const balance = ((creditRows as Record<string, unknown>[])[0]?.balance as number) ?? 0
        await conn.query(
          `INSERT INTO credit_history (id, user_id, type, amount, balance, description)
           VALUES (?, ?, 'refund', ?, ?, '생성 취소 환불')`,
          [uuidv4(), req.user!.id, CREDIT_COST, balance + CREDIT_COST]
        )
        await conn.query("UPDATE tracks SET status = 'error' WHERE id = ?", [track.id])
      }
      res.json({ success: true, message: '생성이 취소되었습니다.' })
    } finally { conn.release() }
  } catch (err) { next(err) }
})

export default router
