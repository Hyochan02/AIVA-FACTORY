/**
 * 음악 편집 라우트: /api/editor
 * POST /extend        - 음악 연장 (Suno extend)
 * POST /lyrics        - 가사 생성 (Suno lyrics)
 * GET  /lyrics/:jobId - 가사 생성 상태 폴링
 * POST /separate      - 보컬/악기 분리 (Suno vocal-removal)
 * GET  /separate/:jobId - 분리 상태 폴링
 * POST /wav           - WAV 변환 (Suno wav)
 * GET  /wav/:jobId    - WAV 변환 상태 폴링
 * POST /video         - 뮤직비디오 생성 (Suno mp4)
 * GET  /video/:jobId  - 비디오 상태 폴링
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

// ── 헬퍼: 트랙 소유권 검증 ─────────────────────────────────
async function getOwnedTrack(trackId: string, userId: string) {
  const conn = await pool.getConnection()
  try {
    const [rows] = await conn.query(
      "SELECT t.*, tv.suno_audio_id, tv.audio_url as v_audio_url, tv.title as v_title FROM tracks t LEFT JOIN track_versions tv ON tv.track_id = t.id AND tv.version_num = 1 WHERE t.id = ? AND t.user_id = ? AND t.status = 'done'",
      [trackId, userId]
    )
    return (rows as Record<string, unknown>[])[0] ?? null
  } finally { conn.release() }
}

// ── 헬퍼: suno_jobs 저장 ────────────────────────────────────
async function saveJob(type: string, trackId: string, sunoTaskId: string, extra = '{}') {
  const conn = await pool.getConnection()
  try {
    const jobId = uuidv4()
    await conn.query(
      `INSERT INTO suno_jobs (id, track_id, type, suno_task_id, status, extra)
       VALUES (?, ?, ?, ?, 'pending', ?)`,
      [jobId, trackId, type, sunoTaskId, extra]
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
       JOIN tracks t ON t.id = sj.track_id
       WHERE sj.id = ? AND t.user_id = ?`,
      [jobId, userId]
    )
    return (rows as Record<string, unknown>[])[0] ?? null
  } finally { conn.release() }
}

// ──────────────────────────────────────────────────────────
// 1. 음악 연장 (Extend)
// ──────────────────────────────────────────────────────────
router.post('/extend', async (req, res, next) => {
  try {
    const { trackId, prompt, style, continueAt } = z.object({
      trackId:    z.string().uuid(),
      prompt:     z.string().max(500).optional(),
      style:      z.string().max(200).optional(),
      continueAt: z.number().min(0).default(60),
    }).parse(req.body)

    const track = await getOwnedTrack(trackId, req.user!.id)
    if (!track) { res.status(404).json({ success: false, error: '트랙을 찾을 수 없습니다.' }); return }

    if (!process.env.SUNO_API_KEY) {
      res.json({ success: true, data: { jobId: `mock_extend_${Date.now()}`, message: '개발 모드 - 실제 호출 없음' } })
      return
    }

    const sunoRes = await axios.post(
      `${SUNO_BASE()}/api/v1/generate/extend`,
      {
        defaultParamFlag: true,
        audioId:    track.suno_audio_id,
        model:      'V4_5ALL',
        prompt:     prompt || '',
        style:      style  || track.genre || '',
        title:      track.title,
        continueAt,
        callBackUrl: `${CALLBACK_BASE()}/api/editor/callback/extend`,
      },
      { headers: SUNO_HEADERS(), timeout: 15000 }
    )

    const sunoTaskId: string = sunoRes.data?.data?.taskId
    const jobId = await saveJob('extend', trackId, sunoTaskId, JSON.stringify({ continueAt }))
    res.json({ success: true, data: { jobId, sunoTaskId } })
  } catch (err) { next(err) }
})

// ── GET /api/editor/extend/:jobId ──────────────────────────
router.get('/extend/:jobId', async (req, res, next) => {
  try {
    const job = await getJob(req.params.jobId, req.user!.id)
    if (!job) { res.status(404).json({ success: false, error: '작업을 찾을 수 없습니다.' }); return }

    if (!process.env.SUNO_API_KEY) {
      res.json({ success: true, data: { status: 'done', audioUrl: 'https://example.com/mock-extended.mp3' } })
      return
    }

    const sunoRes = await axios.get(
      `${SUNO_BASE()}/api/v1/generate/record-info?taskId=${job.suno_task_id}`,
      { headers: SUNO_HEADERS(), timeout: 10000 }
    )
    const sunoStatus: string = sunoRes.data?.data?.status ?? 'PENDING'

    if (sunoStatus === 'SUCCESS') {
      const sunoData = sunoRes.data.data.response?.sunoData ?? []
      const audioUrl = sunoData[0]?.audioUrl ?? null
      const conn = await pool.getConnection()
      try {
        await conn.query("UPDATE suno_jobs SET status = 'done', result_url = ? WHERE id = ?", [audioUrl, job.id])
      } finally { conn.release() }
      res.json({ success: true, data: { status: 'done', audioUrl } })
    } else {
      res.json({ success: true, data: { status: 'pending', progress: sunoStatus === 'FIRST_SUCCESS' ? 60 : 30 } })
    }
  } catch (err) { next(err) }
})

// ──────────────────────────────────────────────────────────
// 2. 가사 생성 (Lyrics)
// ──────────────────────────────────────────────────────────
router.post('/lyrics', async (req, res, next) => {
  try {
    const { prompt } = z.object({ prompt: z.string().min(1).max(300) }).parse(req.body)

    if (!process.env.SUNO_API_KEY) {
      res.json({ success: true, data: { jobId: `mock_lyrics_${Date.now()}` } })
      return
    }

    const sunoRes = await axios.post(
      `${SUNO_BASE()}/api/v1/lyrics`,
      { prompt, callBackUrl: `${CALLBACK_BASE()}/api/editor/callback/lyrics` },
      { headers: SUNO_HEADERS(), timeout: 15000 }
    )

    const sunoTaskId: string = sunoRes.data?.data?.taskId
    const jobId = await saveJob('lyrics', 'none', sunoTaskId, JSON.stringify({ prompt }))
    res.json({ success: true, data: { jobId, sunoTaskId } })
  } catch (err) { next(err) }
})

// ── GET /api/editor/lyrics/:jobId ──────────────────────────
router.get('/lyrics/:jobId', async (req, res, next) => {
  try {
    const job = await getJob(req.params.jobId, req.user!.id)
    if (!job) { res.status(404).json({ success: false, error: '작업을 찾을 수 없습니다.' }); return }

    if (!process.env.SUNO_API_KEY) {
      res.json({ success: true, data: {
        status: 'done',
        title: 'Mock Song Title',
        text: '[Verse 1]\nThis is a mock lyric line\nGenerated for development\n\n[Chorus]\nMock chorus here\nWith some cool words',
      }})
      return
    }

    const sunoRes = await axios.get(
      `${SUNO_BASE()}/api/v1/lyrics/record-info?taskId=${job.suno_task_id}`,
      { headers: SUNO_HEADERS(), timeout: 10000 }
    )
    const data = sunoRes.data?.data
    if (data?.status === 'SUCCESS') {
      const conn = await pool.getConnection()
      try {
        await conn.query("UPDATE suno_jobs SET status = 'done' WHERE id = ?", [job.id])
      } finally { conn.release() }
      res.json({ success: true, data: {
        status: 'done',
        title: data.response?.title ?? '',
        text:  data.response?.text  ?? '',
      }})
    } else {
      res.json({ success: true, data: { status: 'pending' } })
    }
  } catch (err) { next(err) }
})

// ──────────────────────────────────────────────────────────
// 3. 보컬/악기 분리 (Separate)
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
    const jobId = await saveJob('separate', trackId, sunoTaskId, JSON.stringify({ type }))
    res.json({ success: true, data: { jobId, sunoTaskId } })
  } catch (err) { next(err) }
})

// ── GET /api/editor/separate/:jobId ────────────────────────
router.get('/separate/:jobId', async (req, res, next) => {
  try {
    const job = await getJob(req.params.jobId, req.user!.id)
    if (!job) { res.status(404).json({ success: false, error: '작업을 찾을 수 없습니다.' }); return }

    if (!process.env.SUNO_API_KEY) {
      res.json({ success: true, data: {
        status: 'done',
        vocalUrl:        'https://example.com/mock-vocals.mp3',
        instrumentalUrl: 'https://example.com/mock-instrumental.mp3',
      }})
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
        await conn.query("UPDATE suno_jobs SET status = 'done' WHERE id = ?", [job.id])
      } finally { conn.release() }
      res.json({ success: true, data: { status: 'done', ...info } })
    } else {
      res.json({ success: true, data: { status: 'pending' } })
    }
  } catch (err) { next(err) }
})

// ──────────────────────────────────────────────────────────
// 4. WAV 변환
// ──────────────────────────────────────────────────────────
router.post('/wav', async (req, res, next) => {
  try {
    const { trackId, versionNum } = z.object({
      trackId:    z.string().uuid(),
      versionNum: z.number().int().min(1).max(2).default(1),
    }).parse(req.body)

    const track = await getOwnedTrack(trackId, req.user!.id)
    if (!track) { res.status(404).json({ success: false, error: '트랙을 찾을 수 없습니다.' }); return }

    if (!process.env.SUNO_API_KEY) {
      res.json({ success: true, data: { jobId: `mock_wav_${Date.now()}` } })
      return
    }

    // 선택된 버전의 audioId 가져오기
    const conn2 = await pool.getConnection()
    let audioId = track.suno_audio_id as string
    try {
      const [vRows] = await conn2.query(
        'SELECT suno_audio_id FROM track_versions WHERE track_id = ? AND version_num = ?',
        [trackId, versionNum]
      )
      const vRow = (vRows as Record<string, unknown>[])[0]
      if (vRow?.suno_audio_id) audioId = vRow.suno_audio_id as string
    } finally { conn2.release() }

    const sunoRes = await axios.post(
      `${SUNO_BASE()}/api/v1/wav/generate`,
      {
        taskId:      track.suno_task_id,
        audioId,
        callBackUrl: `${CALLBACK_BASE()}/api/editor/callback/wav`,
      },
      { headers: SUNO_HEADERS(), timeout: 15000 }
    )

    const sunoTaskId: string = sunoRes.data?.data?.taskId
    const jobId = await saveJob('wav', trackId, sunoTaskId, '{}')
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
// 5. 뮤직비디오 생성
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
    const jobId = await saveJob('video', trackId, sunoTaskId, '{}')
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

// ── Callback handlers (Suno → 우리 서버, 인증 불필요) ──────
router.post('/callback/:type', async (req, res) => {
  // 콜백 수신 시 suno_jobs 테이블 업데이트
  try {
    const { data } = req.body
    if (data?.task_id) {
      const conn = await pool.getConnection()
      try {
        await conn.query(
          "UPDATE suno_jobs SET status = 'done' WHERE suno_task_id = ? AND status = 'pending'",
          [data.task_id]
        )
      } finally { conn.release() }
    }
  } catch { /* ignore callback errors */ }
  res.json({ ok: true })
})

export default router
