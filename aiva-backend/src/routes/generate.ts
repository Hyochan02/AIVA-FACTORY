/**
 * 음악 생성 라우트: /api/generate
 * POST /          - 생성 요청 (Suno AI 연동)
 * GET  /:taskId/status - 상태 폴링
 * DELETE /:taskId - 취소
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

// 생성 API 전용 Rate Limit (크레딧 낭비 방지)
const generateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  keyGenerator: (req) => req.user!.id,
  message: { success: false, error: '너무 많은 생성 요청입니다. 1분 후 다시 시도해주세요.', code: 'RATE_LIMITED' },
})

const CREDIT_COST = 4

const generateSchema = z.object({
  prompt:       z.string().min(1).max(500),
  genre:        z.string().optional(),
  mood:         z.string().optional(),
  instruments:  z.array(z.string()).optional(),
  bpm:          z.number().min(60).max(200).optional(),
  duration:     z.number().min(30).max(240).default(120),
  instrumental: z.boolean().default(false),
})

// ── POST /api/generate ─────────────────────────────────────
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
      await conn.query(
        `INSERT INTO tracks (id, user_id, title, prompt, genre, mood, bpm, duration, status)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending')`,
        [trackId, req.user!.id, body.prompt.slice(0, 50), body.prompt,
         body.genre ?? null, body.mood ?? null, body.bpm ?? null, body.duration]
      )

      // 3. Suno API 호출
      const tags = [body.genre, body.mood, ...(body.instruments ?? [])].filter(Boolean).join(', ')
      let sunoTaskId = `mock_${Date.now()}`

      if (process.env.SUNO_API_KEY) {
        try {
          const sunoRes = await axios.post(
            `${process.env.SUNO_API_BASE_URL}/api/generate`,
            { prompt: body.prompt, tags, make_instrumental: body.instrumental, mv: 'chirp-v3-5' },
            { headers: { Authorization: `Bearer ${process.env.SUNO_API_KEY}` }, timeout: 10000 }
          )
          sunoTaskId = sunoRes.data?.id ?? sunoTaskId
        } catch (sunoErr) {
          console.error('[Suno API Error]', sunoErr)
          res.status(503).json({ success: false, error: 'Suno AI 서버에 연결할 수 없습니다.', code: 'SUNO_UNAVAILABLE' })
          return
        }
      }

      // 4. task_id 저장, status → generating
      await conn.query(
        "UPDATE tracks SET suno_task_id = ?, status = 'generating' WHERE id = ?",
        [sunoTaskId, trackId]
      )

      // 5. 크레딧 차감
      const newBalance = balance - CREDIT_COST
      await conn.query(
        'INSERT INTO credit_history (id, user_id, type, amount, balance, description, track_id) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [uuidv4(), req.user!.id, 'usage', -CREDIT_COST, newBalance, '음악 생성', trackId]
      )

      res.status(202).json({
        success: true,
        data: { taskId: sunoTaskId, trackId, estimatedSeconds: 30, creditsUsed: CREDIT_COST, creditsRemaining: newBalance },
      })
    } finally { conn.release() }
  } catch (err) { next(err) }
})

// ── GET /api/generate/:taskId/status ──────────────────────
router.get('/:taskId/status', async (req, res, next) => {
  try {
    const conn = await pool.getConnection()
    try {
      const [rows] = await conn.query(
        'SELECT * FROM tracks WHERE suno_task_id = ? AND user_id = ?',
        [req.params.taskId, req.user!.id]
      )
      const track = (rows as Record<string, unknown>[])[0]
      if (!track) { res.status(404).json({ success: false, error: '트랙을 찾을 수 없습니다.' }); return }

      // 이미 완료된 경우 캐시된 결과 반환
      if (track.status === 'done') {
        res.json({ success: true, data: { taskId: req.params.taskId, trackId: track.id, status: 'done', progress: 100, audioUrl: track.audio_url } })
        return
      }

      // Suno API 상태 확인
      let progress = 50
      let status = track.status as string

      if (process.env.SUNO_API_KEY) {
        const sunoRes = await axios.get(
          `${process.env.SUNO_API_BASE_URL}/api/get?ids=${req.params.taskId}`,
          { headers: { Authorization: `Bearer ${process.env.SUNO_API_KEY}` } }
        )
        const sunoTrack = sunoRes.data?.[0]
        if (sunoTrack?.status === 'complete') {
          status = 'done'
          progress = 100
          // TODO: S3에 오디오 업로드 후 URL 저장
          await conn.query("UPDATE tracks SET status = 'done', audio_url = ? WHERE id = ?", [sunoTrack.audio_url, track.id])
        }
      } else {
        // 개발용 시뮬레이션: 30초 후 완료
        const elapsed = Date.now() - new Date(track.created_at as string).getTime()
        progress = Math.min(Math.floor(elapsed / 300), 99)
        if (progress >= 99) { status = 'done'; progress = 100; await conn.query("UPDATE tracks SET status = 'done' WHERE id = ?", [track.id]) }
      }

      const stepLabels: Record<string, string> = {
        pending: '요청 처리 중', generating: '오디오 합성 중', done: '완료', error: '오류 발생'
      }

      res.json({ success: true, data: {
        taskId: req.params.taskId, trackId: track.id,
        status, progress, step: stepLabels[status],
        audioUrl: status === 'done' ? track.audio_url : null,
      }})
    } finally { conn.release() }
  } catch (err) { next(err) }
})

// ── DELETE /api/generate/:taskId ───────────────────────────
router.delete('/:taskId', async (req, res, next) => {
  try {
    const conn = await pool.getConnection()
    try {
      const [rows] = await conn.query(
        "SELECT * FROM tracks WHERE suno_task_id = ? AND user_id = ? AND status = 'pending'",
        [req.params.taskId, req.user!.id]
      )
      const track = (rows as Record<string, unknown>[])[0]
      if (track) {
        // 크레딧 환불
        const [creditRows] = await conn.query(
          'SELECT balance FROM credit_history WHERE user_id = ? ORDER BY created_at DESC LIMIT 1',
          [req.user!.id]
        )
        const balance = ((creditRows as Record<string, unknown>[])[0]?.balance as number) ?? 0
        await conn.query(
          'INSERT INTO credit_history (id, user_id, type, amount, balance, description) VALUES (?, ?, ?, ?, ?, ?)',
          [uuidv4(), req.user!.id, 'refund', CREDIT_COST, balance + CREDIT_COST, '생성 취소 환불']
        )
        await conn.query("UPDATE tracks SET status = 'error' WHERE id = ?", [track.id])
      }
      res.json({ success: true, message: '생성이 취소되었습니다.' })
    } finally { conn.release() }
  } catch (err) { next(err) }
})

export default router
