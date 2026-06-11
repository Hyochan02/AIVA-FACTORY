/**
 * 음악 편집 라우트: /api/editor
 * POST /separate        - 보컬/악기 분리 (Suno vocal-removal, split_stem 시 12개 스템 자동 저장)
 * GET  /separate/:jobId - 분리 상태 폴링 (track_stems 저장 결과 반환)
 * POST /wav             - WAV 변환 (Suno wav)
 * GET  /wav/:jobId      - WAV 변환 상태 폴링
 * POST /video           - 뮤직비디오 생성 (Suno mp4)
 * GET  /video/:jobId    - 비디오 상태 폴링
 * GET  /mix/:trackId    - 저장된 믹스 설정(stem별 볼륨/뮤트/솔로) 조회
 * PUT  /mix/:trackId    - 믹스 설정 저장
 *
 * 참고: 음악 연장(extend)·가사 생성(lyrics) 기능은 v3에서 제거되었습니다.
 *       (악기별 믹싱 기능에 집중하기 위한 결정 — DB 마이그레이션 migrate_v3.sql 참고)
 */
import { Router } from 'express'
import { z } from 'zod'
import axios from 'axios'
import { authenticate } from '../middlewares/auth'
import { pool } from '../config/database'
import { v4 as uuidv4 } from 'uuid'

const router = Router()
router.use(authenticate)

const SUNO_BASE     = () => process.env.SUNO_API_BASE_URL || 'https://api.sunoapi.org'
const SUNO_HEADERS  = () => ({ Authorization: `Bearer ${process.env.SUNO_API_KEY}` })
const CALLBACK_BASE = () => process.env.API_BASE_URL || 'https://api.aiva-factory.p-e.kr'

type Conn = Awaited<ReturnType<typeof pool.getConnection>>

// Suno split_stem 응답 필드명 → track_stems.stem_type 매핑
// (separate_vocal 모드는 vocal_url / instrumental_url 만 채워진다)
const STEM_FIELD_MAP: Record<string, string> = {
  vocals:         'vocal_url',
  backing_vocals: 'backing_vocals_url',
  drums:          'drums_url',
  bass:           'bass_url',
  guitar:         'guitar_url',
  keyboard:       'keyboard_url',
  percussion:     'percussion_url',
  strings:        'strings_url',
  synth:          'synth_url',
  fx:             'fx_url',
  brass:          'brass_url',
  woodwinds:      'woodwinds_url',
  instrumental:   'instrumental_url',
}

// ── 헬퍼: split_stem/separate_vocal 결과를 track_stems 테이블에 upsert ──
// 같은 (track_id, stem_type) 조합이 다시 들어오면 UNIQUE 제약 + ON DUPLICATE
// KEY UPDATE 로 최신 URL 로 덮어쓴다 (재분리 요청 시 중복 행 방지).
async function saveStems(conn: Conn, trackId: string, info: Record<string, unknown>) {
  const saved: Record<string, string> = {}
  for (const [stemType, field] of Object.entries(STEM_FIELD_MAP)) {
    const url = info[field]
    if (typeof url === 'string' && url) {
      await conn.query(
        `INSERT INTO track_stems (id, track_id, stem_type, audio_url)
         VALUES (?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE audio_url = VALUES(audio_url)`,
        [uuidv4(), trackId, stemType, url]
      )
      saved[stemType] = url
    }
  }
  return saved
}

// ── 헬퍼: 트랙 소유권 검증 ─────────────────────────────────
// v3부터 tracks 테이블이 버전(variation)당 1행이고 suno_audio_id를
// 직접 보유하므로, 더 이상 track_versions JOIN이 필요 없다.
async function getOwnedTrack(trackId: string, userId: string) {
  const conn = await pool.getConnection()
  try {
    const [rows] = await conn.query(
      "SELECT * FROM tracks WHERE id = ? AND user_id = ? AND status = 'done'",
      [trackId, userId]
    )
    return (rows as Record<string, unknown>[])[0] ?? null
  } finally { conn.release() }
}

// ── 헬퍼: suno_jobs 저장 ────────────────────────────────────
async function saveJob(type: string, trackId: string | null, sunoTaskId: string, userId: string, extra = '{}') {
  const conn = await pool.getConnection()
  try {
    const jobId = uuidv4()
    await conn.query(
      `INSERT INTO suno_jobs (id, track_id, type, suno_task_id, status, user_id, extra)
       VALUES (?, ?, ?, ?, 'pending', ?, ?)`,
      [jobId, trackId ?? null, type, sunoTaskId, userId, extra]
    )
    return jobId
  } finally { conn.release() }
}

// ── 헬퍼: suno_jobs 조회 ────────────────────────────────────
async function getJob(jobId: string, userId: string) {
  const conn = await pool.getConnection()
  try {
    const [rows] = await conn.query(
      `SELECT sj.* FROM suno_jobs sj
       WHERE sj.id = ? AND sj.user_id = ?`,
      [jobId, userId]
    )
    return (rows as Record<string, unknown>[])[0] ?? null
  } finally { conn.release() }
}

// 히스토리 목록 조회
async function getJobs(userId: string, type?: string, limit = 30) {
  const conn = await pool.getConnection()
  try {
    const validTypes = ['separate', 'wav', 'video']
    const useType = type && validTypes.includes(type) ? type : null

    const query = useType
      ? `SELECT sj.id, sj.type, sj.status, sj.result_url, sj.extra, sj.created_at,
                t.title AS track_title
         FROM suno_jobs sj
         LEFT JOIN tracks t ON t.id = sj.track_id
         WHERE sj.user_id = ? AND sj.type = ?
         ORDER BY sj.created_at DESC
         LIMIT ?`
      : `SELECT sj.id, sj.type, sj.status, sj.result_url, sj.extra, sj.created_at,
                t.title AS track_title
         FROM suno_jobs sj
         LEFT JOIN tracks t ON t.id = sj.track_id
         WHERE sj.user_id = ?
         ORDER BY sj.created_at DESC
         LIMIT ?`

    const params = useType ? [userId, useType, limit] : [userId, limit]
    const [rows] = await conn.query(query, params)
    return rows as Record<string, unknown>[]
  } finally { conn.release() }
}

// ──────────────────────────────────────────────────────────
// 1. 보컬/악기 분리 (Separate)
// ──────────────────────────────────────────────────────────
router.post('/separate', async (req, res, next) => {
  try {
    const { trackId, type } = z.object({
      trackId: z.string().uuid(),
      type:    z.enum(['separate_vocal', 'split_stem']).default('separate_vocal'),
    }).parse(req.body)

    const track = await getOwnedTrack(trackId, req.user!.id)
    if (!track) { res.status(404).json({ success: false, error: '트랙을 찾을 수 없습니다.' }); return }

    if (!process.env.SUNO_API_KEY) {
      res.json({ success: true, data: { jobId: `mock_separate_${Date.now()}` } })
      return
    }

    const sunoRes = await axios.post(
      `${SUNO_BASE()}/api/v1/vocal-removal/generate`,
      {
        taskId:      track.suno_task_id,
        audioId:     track.suno_audio_id,
        type,
        callBackUrl: `${CALLBACK_BASE()}/api/editor/callback/separate`,
      },
      { headers: SUNO_HEADERS(), timeout: 15000 }
    )

    const sunoTaskId: string = sunoRes.data?.data?.taskId
    const jobId = await saveJob('separate', trackId, sunoTaskId, req.user!.id, JSON.stringify({ type }))
    res.json({ success: true, data: { jobId, sunoTaskId } })
  } catch (err) { next(err) }
})

// ── GET /api/editor/separate/:jobId ────────────────────────
// split_stem 결과를 폴링한다. 정상 흐름에서는 자동 분리 결과가
// POST /callback/separate 웹훅으로 먼저 도착해 track_stems에 저장되므로,
// 여기서는 "혹시 아직 콜백이 안 왔을 때"를 위한 보조 경로로도 동작한다.
router.get('/separate/:jobId', async (req, res, next) => {
  try {
    const job = await getJob(req.params.jobId, req.user!.id)
    if (!job) { res.status(404).json({ success: false, error: '작업을 찾을 수 없습니다.' }); return }

    if (!process.env.SUNO_API_KEY) {
      res.json({ success: true, data: {
        status: 'done',
        stems: {
          vocals:       'https://example.com/mock-vocals.mp3',
          instrumental: 'https://example.com/mock-instrumental.mp3',
        },
      }})
      return
    }

    // 이미 콜백으로 처리되어 done 상태라면 track_stems에서 바로 읽어온다
    if (job.status === 'done' && job.track_id) {
      const [rows] = await pool.query(
        'SELECT stem_type, audio_url FROM track_stems WHERE track_id = ?',
        [job.track_id]
      )
      const stems: Record<string, string> = {}
      for (const r of rows as Record<string, unknown>[]) stems[r.stem_type as string] = r.audio_url as string
      res.json({ success: true, data: { status: 'done', stems } })
      return
    }

    const sunoRes = await axios.get(
      `${SUNO_BASE()}/api/v1/vocal-removal/record-info?taskId=${job.suno_task_id}`,
      { headers: SUNO_HEADERS(), timeout: 10000 }
    )
    const data = sunoRes.data?.data
    if (data?.status === 'SUCCESS') {
      const info = data.vocal_removal_info ?? {}
      const conn = await pool.getConnection()
      try {
        const stems = job.track_id ? await saveStems(conn, job.track_id as string, info) : {}
        await conn.query("UPDATE suno_jobs SET status = 'done', extra = ? WHERE id = ?", [
          JSON.stringify({ ...(typeof job.extra === 'string' ? JSON.parse(job.extra || '{}') : (job.extra ?? {})), stems }),
          job.id,
        ])
        res.json({ success: true, data: { status: 'done', stems } })
      } finally { conn.release() }
    } else {
      res.json({ success: true, data: { status: 'pending' } })
    }
  } catch (err) { next(err) }
})

// ──────────────────────────────────────────────────────────
// 2. WAV 변환
// ──────────────────────────────────────────────────────────
router.post('/wav', async (req, res, next) => {
  try {
    const { trackId } = z.object({
      trackId: z.string().uuid(),
    }).parse(req.body)

    const track = await getOwnedTrack(trackId, req.user!.id)
    if (!track) { res.status(404).json({ success: false, error: '트랙을 찾을 수 없습니다.' }); return }

    if (!process.env.SUNO_API_KEY) {
      res.json({ success: true, data: { jobId: `mock_wav_${Date.now()}` } })
      return
    }

    // v3부터 버전(variation)마다 별도의 tracks row 이므로,
    // 해당 트랙 자신의 suno_audio_id를 그대로 사용하면 된다.
    const sunoRes = await axios.post(
      `${SUNO_BASE()}/api/v1/wav/generate`,
      {
        taskId:      track.suno_task_id,
        audioId:     track.suno_audio_id,
        callBackUrl: `${CALLBACK_BASE()}/api/editor/callback/wav`,
      },
      { headers: SUNO_HEADERS(), timeout: 15000 }
    )

    const sunoTaskId: string = sunoRes.data?.data?.taskId
    const jobId = await saveJob('wav', trackId, sunoTaskId, req.user!.id, '{}')
    res.json({ success: true, data: { jobId, sunoTaskId } })
  } catch (err) { next(err) }
})

// ── GET /api/editor/wav/:jobId ─────────────────────────────
router.get('/wav/:jobId', async (req, res, next) => {
  try {
    const job = await getJob(req.params.jobId, req.user!.id)
    if (!job) { res.status(404).json({ success: false, error: '작업을 찾을 수 없습니다.' }); return }

    if (!process.env.SUNO_API_KEY) {
      res.json({ success: true, data: { status: 'done', wavUrl: 'https://example.com/mock.wav' } })
      return
    }

    const sunoRes = await axios.get(
      `${SUNO_BASE()}/api/v1/wav/record-info?taskId=${job.suno_task_id}`,
      { headers: SUNO_HEADERS(), timeout: 10000 }
    )
    const data = sunoRes.data?.data
    if (data?.status === 'SUCCESS') {
      const wavUrl = data.audioWavUrl ?? null
      const conn = await pool.getConnection()
      try {
        await conn.query("UPDATE suno_jobs SET status = 'done', result_url = ? WHERE id = ?", [wavUrl, job.id])
      } finally { conn.release() }
      res.json({ success: true, data: { status: 'done', wavUrl } })
    } else {
      res.json({ success: true, data: { status: 'pending' } })
    }
  } catch (err) { next(err) }
})

// ──────────────────────────────────────────────────────────
// 3. 뮤직비디오 생성
// ──────────────────────────────────────────────────────────
router.post('/video', async (req, res, next) => {
  try {
    const { trackId } = z.object({ trackId: z.string().uuid() }).parse(req.body)

    const track = await getOwnedTrack(trackId, req.user!.id)
    if (!track) { res.status(404).json({ success: false, error: '트랙을 찾을 수 없습니다.' }); return }

    if (!process.env.SUNO_API_KEY) {
      res.json({ success: true, data: { jobId: `mock_video_${Date.now()}` } })
      return
    }

    const sunoRes = await axios.post(
      `${SUNO_BASE()}/api/v1/mp4/generate`,
      {
        taskId:      track.suno_task_id,
        audioId:     track.suno_audio_id,
        author:      'AIVA FACTORY',
        domainName:  'aiva-factory.p-e.kr',
        callBackUrl: `${CALLBACK_BASE()}/api/editor/callback/video`,
      },
      { headers: SUNO_HEADERS(), timeout: 15000 }
    )

    const sunoTaskId: string = sunoRes.data?.data?.taskId
    const jobId = await saveJob('video', trackId, sunoTaskId, req.user!.id, '{}')
    res.json({ success: true, data: { jobId, sunoTaskId } })
  } catch (err) { next(err) }
})

// ── GET /api/editor/video/:jobId ───────────────────────────
router.get('/video/:jobId', async (req, res, next) => {
  try {
    const job = await getJob(req.params.jobId, req.user!.id)
    if (!job) { res.status(404).json({ success: false, error: '작업을 찾을 수 없습니다.' }); return }

    if (!process.env.SUNO_API_KEY) {
      res.json({ success: true, data: { status: 'done', videoUrl: 'https://example.com/mock.mp4' } })
      return
    }

    const sunoRes = await axios.get(
      `${SUNO_BASE()}/api/v1/mp4/record-info?taskId=${job.suno_task_id}`,
      { headers: SUNO_HEADERS(), timeout: 10000 }
    )
    const data = sunoRes.data?.data
    if (data?.status === 'SUCCESS') {
      const videoUrl = data.video_url ?? null
      const conn = await pool.getConnection()
      try {
        await conn.query("UPDATE suno_jobs SET status = 'done', result_url = ? WHERE id = ?", [videoUrl, job.id])
      } finally { conn.release() }
      res.json({ success: true, data: { status: 'done', videoUrl } })
    } else {
      res.json({ success: true, data: { status: 'pending' } })
    }
  } catch (err) { next(err) }
})

// ──────────────────────────────────────────────────────────
// 4. 믹스 설정 저장/조회 (Stem 편집기 — 트랙별 볼륨/뮤트/솔로)
// ──────────────────────────────────────────────────────────
// editor_settings 테이블(schema.sql에 이미 정의되어 있던 미사용 테이블)을
// 재활용한다: track_id를 PK로 stem_config JSON에 { [stemType]: { volume, muted, solo } }
// 형태로 저장한다. 별도 마이그레이션 불필요.
const StemMixConfigSchema = z.record(
  z.string(),
  z.object({
    volume: z.number().min(0).max(1),
    muted: z.boolean(),
    solo: z.boolean(),
  })
)

// ── GET /api/editor/mix/:trackId — 저장된 믹스 설정 조회 ──
router.get('/mix/:trackId', async (req, res, next) => {
  try {
    const track = await getOwnedTrack(req.params.trackId, req.user!.id)
    if (!track) { res.status(404).json({ success: false, error: '트랙을 찾을 수 없습니다.' }); return }

    const [rows] = await pool.query(
      'SELECT stem_config FROM editor_settings WHERE track_id = ?',
      [req.params.trackId]
    )
    const row = (rows as Record<string, unknown>[])[0]
    const raw = row?.stem_config
    const stemConfig = raw
      ? (typeof raw === 'string' ? JSON.parse(raw) : raw)
      : null
    res.json({ success: true, data: { stemConfig } })
  } catch (err) { next(err) }
})

// ── PUT /api/editor/mix/:trackId — 믹스 설정 저장(upsert) ──
router.put('/mix/:trackId', async (req, res, next) => {
  try {
    const track = await getOwnedTrack(req.params.trackId, req.user!.id)
    if (!track) { res.status(404).json({ success: false, error: '트랙을 찾을 수 없습니다.' }); return }

    const stemConfig = StemMixConfigSchema.parse(req.body?.stemConfig ?? {})

    await pool.query(
      `INSERT INTO editor_settings (track_id, stem_config)
       VALUES (?, ?)
       ON DUPLICATE KEY UPDATE stem_config = VALUES(stem_config)`,
      [req.params.trackId, JSON.stringify(stemConfig)]
    )
    res.json({ success: true, data: { stemConfig } })
  } catch (err) { next(err) }
})

// ── GET /api/editor/jobs ─ 히스토리 목록 ──────────────────
router.get('/jobs', async (req, res, next) => {
  try {
    const type  = req.query.type  as string | undefined
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 30
    const jobs  = await getJobs(req.user!.id, type, isNaN(limit) ? 30 : limit)
    res.json({ success: true, data: { jobs } })
  } catch (err) { next(err) }
})

// ── Callback handlers (Suno → 우리 서버, 인증 불필요) ──────
router.post('/callback/:type', async (req, res) => {
  // 콜백 수신 시 suno_jobs 테이블 업데이트
  try {
    const { data } = req.body
    if (!data) return res.sendStatus(200)

    const sunoTaskId = data.task_id ?? data.taskId
    if (!sunoTaskId) return res.sendStatus(200)

    const conn = await pool.getConnection()
    try {
      // task_id로 job 조회
      const [rows]: any = await conn.query(
        'SELECT id FROM suno_jobs WHERE suno_task_id = ?',
        [sunoTaskId]
      )
      if (!rows.length) return res.sendStatus(200)

      const jobId = rows[0].id
      const type  = req.params.type

      // 결과 URL 추출 (타입별로 다름)
      let resultUrl: string | null = null
      let extra: string | null = null
      let status: 'done' | 'error' = 'done'

      if (type === 'separate') {
        // split_stem(또는 separate_vocal) 응답에서 최대 12개 스템 URL을
        // 모두 파싱해 track_stems 테이블에 upsert한다.
        const info = data.response ?? data.vocal_removal_info ?? {}
        const [jobRows]: any = await conn.query(
          'SELECT track_id, extra FROM suno_jobs WHERE id = ?',
          [jobId]
        )
        const trackId: string | null = jobRows[0]?.track_id ?? null
        const stems = trackId ? await saveStems(conn, trackId, info) : {}

        if (Object.keys(stems).length === 0) {
          status = 'error'
        } else {
          const prevExtra = (() => {
            const raw = jobRows[0]?.extra
            if (!raw) return {}
            return typeof raw === 'string' ? JSON.parse(raw) : raw
          })()
          extra = JSON.stringify({ ...prevExtra, stems })
          resultUrl = stems.instrumental ?? stems.vocals ?? null
        }
      } else if (type === 'wav') {
        resultUrl = data.response?.audio_url ?? null
        if (!resultUrl) status = 'error'
      } else if (type === 'video') {
        resultUrl = data.response?.video_url ?? null
        if (!resultUrl) status = 'error'
      }

      await conn.query(
        'UPDATE suno_jobs SET status = ?, result_url = ?, extra = ? WHERE id = ?',
        [status, resultUrl, extra, jobId]
      )
    } finally { conn.release() }

    res.sendStatus(200)
  } catch (err) {
    console.error('Callback error:', err)
    res.sendStatus(200)
  }
})

export default router
