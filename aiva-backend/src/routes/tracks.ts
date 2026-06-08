/**
 * 트랙 라우트: /api/tracks
 * GET    /            - 내 트랙 목록 (검색·필터·페이지네이션)
 * GET    /:id         - 트랙 상세
 * PATCH  /:id         - 트랙 수정 (제목, 공개여부)
 * DELETE /:id         - 트랙 삭제
 * GET    /:id/download - 다운로드 URL 발급
 * POST   /:id/like    - 좋아요
 * DELETE /:id/like    - 좋아요 취소
 * GET    /:id/comments  - 댓글 목록
 * POST   /:id/comments  - 댓글 작성
 * DELETE /:id/comments/:cid - 댓글 삭제
 */
import { Router } from 'express'
import { authenticate } from '../middlewares/auth'
import { pool } from '../config/database'
import { v4 as uuidv4 } from 'uuid'

const router = Router()
router.use(authenticate)

// ── GET /api/tracks ────────────────────────────────────────
router.get('/', async (req, res, next) => {
  try {
    const { q, genre, status, page = 1, limit = 20, sort = 'created_at', order = 'desc' } = req.query
    const offset = (Number(page) - 1) * Number(limit)
    const safeSort  = ['created_at', 'title', 'play_count'].includes(sort as string) ? sort : 'created_at'
    const safeOrder = order === 'asc' ? 'ASC' : 'DESC'

    let where = 'WHERE user_id = ?'
    const params: unknown[] = [req.user!.id]
    if (q)      { where += ' AND title LIKE ?';  params.push(`%${q}%`) }
    if (genre)  { where += ' AND genre = ?';     params.push(genre) }
    if (status) { where += ' AND status = ?';    params.push(status) }

    const [items]  = await pool.query(`SELECT * FROM tracks ${where} ORDER BY ${safeSort} ${safeOrder} LIMIT ? OFFSET ?`, [...params, Number(limit), offset])
    const [[count]] = await pool.query(`SELECT COUNT(*) as total FROM tracks ${where}`, params) as unknown[][]
    const total = (count as Record<string, unknown>).total as number

    res.json({ success: true, data: { items, pagination: { page: Number(page), limit: Number(limit), total, totalPages: Math.ceil(total / Number(limit)) } } })
  } catch (err) { next(err) }
})

// ── GET /api/tracks/:id ────────────────────────────────────
router.get('/:id', async (req, res, next) => {
  try {
    const conn = await pool.getConnection()
    try {
      const [rows] = await conn.query('SELECT * FROM tracks WHERE id = ?', [req.params.id])
      const track = (rows as Record<string, unknown>[])[0]
      if (!track) { res.status(404).json({ success: false, error: '트랙을 찾을 수 없습니다.' }); return }
      if (track.user_id !== req.user!.id && !track.is_public) {
        res.status(403).json({ success: false, error: '접근 권한이 없습니다.' }); return
      }

      const [versions] = await conn.query('SELECT * FROM track_versions WHERE track_id = ? ORDER BY version_num', [req.params.id])
      const [[likeCount]] = await conn.query('SELECT COUNT(*) as c FROM likes WHERE track_id = ?', [req.params.id]) as unknown[][]
      const [myLikeRows]  = await conn.query('SELECT 1 FROM likes WHERE track_id = ? AND user_id = ?', [req.params.id, req.user!.id]) as unknown[][]

      // 조회수 증가
      await conn.query('UPDATE tracks SET play_count = play_count + 1 WHERE id = ?', [req.params.id])

      res.json({ success: true, data: {
        ...track,
        versions,
        likeCount: (likeCount as Record<string, unknown>).c,
        isLiked: (myLikeRows as unknown[]).length > 0,
      }})
    } finally { conn.release() }
  } catch (err) { next(err) }
})

// ── PATCH /api/tracks/:id ──────────────────────────────────
router.patch('/:id', async (req, res, next) => {
  try {
    const [rows] = await pool.query('SELECT id, user_id FROM tracks WHERE id = ?', [req.params.id])
    const track = (rows as Record<string, unknown>[])[0]
    if (!track)                           { res.status(404).json({ success: false, error: '트랙을 찾을 수 없습니다.' }); return }
    if (track.user_id !== req.user!.id)   { res.status(403).json({ success: false, error: '권한이 없습니다.' }); return }

    const fields: string[] = []
    const vals: unknown[]  = []
    if (req.body.title     !== undefined) { fields.push('title = ?');     vals.push(req.body.title) }
    if (req.body.isPublic  !== undefined) { fields.push('is_public = ?'); vals.push(req.body.isPublic ? 1 : 0) }

    if (!fields.length) { res.status(400).json({ success: false, error: '수정할 내용이 없습니다.' }); return }
    vals.push(req.params.id)
    await pool.query(`UPDATE tracks SET ${fields.join(', ')} WHERE id = ?`, vals)
    res.json({ success: true, message: '트랙이 업데이트되었습니다.' })
  } catch (err) { next(err) }
})

// ── DELETE /api/tracks/:id ─────────────────────────────────
router.delete('/:id', async (req, res, next) => {
  try {
    const [rows] = await pool.query('SELECT id, user_id, audio_url FROM tracks WHERE id = ?', [req.params.id])
    const track = (rows as Record<string, unknown>[])[0]
    if (!track)                          { res.status(404).json({ success: false, error: '트랙을 찾을 수 없습니다.' }); return }
    if (track.user_id !== req.user!.id)  { res.status(403).json({ success: false, error: '권한이 없습니다.' }); return }

    // TODO: S3에서 오디오 파일 삭제
    await pool.query('DELETE FROM tracks WHERE id = ?', [req.params.id])
    res.json({ success: true, message: '트랙이 삭제되었습니다.' })
  } catch (err) { next(err) }
})

// ── GET /api/tracks/:id/download ──────────────────────────
router.get('/:id/download', async (req, res, next) => {
  try {
    const { format = 'mp3' } = req.query
    const [rows] = await pool.query('SELECT * FROM tracks WHERE id = ? AND user_id = ?', [req.params.id, req.user!.id])
    const track = (rows as Record<string, unknown>[])[0]
    if (!track) { res.status(404).json({ success: false, error: '트랙을 찾을 수 없습니다.' }); return }

    if (format === 'wav' || format === 'stems') {
      const [userRows] = await pool.query('SELECT plan FROM users WHERE id = ?', [req.user!.id])
      const user = (userRows as Record<string, unknown>[])[0]
      if (user.plan === 'free') {
        res.status(403).json({ success: false, error: 'Pro 플랜 이상에서만 이용 가능합니다.', code: 'PLAN_REQUIRED' }); return
      }
    }

    // TODO: AWS S3 Pre-signed URL 발급 (aws-sdk 사용)
    // const url = await generatePresignedUrl(track.audio_url, 900)
    const mockUrl = `${track.audio_url}?mock_presigned=1&expires=${Date.now() + 900_000}`
    res.json({ success: true, data: { downloadUrl: mockUrl, expiresIn: 900, filename: `${track.title}.${format}` } })
  } catch (err) { next(err) }
})

// ── POST /api/tracks/:id/like ──────────────────────────────
router.post('/:id/like', async (req, res, next) => {
  try {
    const conn = await pool.getConnection()
    try {
      const [exists] = await conn.query('SELECT 1 FROM likes WHERE track_id = ? AND user_id = ?', [req.params.id, req.user!.id])
      if ((exists as unknown[]).length > 0) { res.status(409).json({ success: false, error: '이미 좋아요한 트랙입니다.', code: 'ALREADY_LIKED' }); return }
      await conn.query('INSERT INTO likes (user_id, track_id) VALUES (?, ?)', [req.user!.id, req.params.id])
      await conn.query('UPDATE tracks SET like_count = like_count + 1 WHERE id = ?', [req.params.id])
      res.json({ success: true, message: '좋아요를 눌렀습니다.' })
    } finally { conn.release() }
  } catch (err) { next(err) }
})

// ── DELETE /api/tracks/:id/like ────────────────────────────
router.delete('/:id/like', async (req, res, next) => {
  try {
    const conn = await pool.getConnection()
    try {
      await conn.query('DELETE FROM likes WHERE track_id = ? AND user_id = ?', [req.params.id, req.user!.id])
      await conn.query('UPDATE tracks SET like_count = GREATEST(like_count - 1, 0) WHERE id = ?', [req.params.id])
      res.json({ success: true, message: '좋아요를 취소했습니다.' })
    } finally { conn.release() }
  } catch (err) { next(err) }
})

// ── GET /api/tracks/:id/comments ──────────────────────────
router.get('/:id/comments', async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query
    const offset = (Number(page) - 1) * Number(limit)
    const [items] = await pool.query(
      `SELECT c.*, u.name as user_name, u.avatar_url
       FROM comments c JOIN users u ON c.user_id = u.id
       WHERE c.track_id = ? ORDER BY c.created_at DESC LIMIT ? OFFSET ?`,
      [req.params.id, Number(limit), offset]
    )
    res.json({ success: true, data: { items } })
  } catch (err) { next(err) }
})

// ── POST /api/tracks/:id/comments ─────────────────────────
router.post('/:id/comments', async (req, res, next) => {
  try {
    const { content } = req.body
    if (!content || content.length < 1 || content.length > 500) {
      res.status(400).json({ success: false, error: '댓글은 1~500자로 입력해주세요.' }); return
    }
    const id = uuidv4()
    await pool.query('INSERT INTO comments (id, track_id, user_id, content) VALUES (?, ?, ?, ?)',
      [id, req.params.id, req.user!.id, content])
    res.status(201).json({ success: true, data: { id, content } })
  } catch (err) { next(err) }
})

// ── DELETE /api/tracks/:id/comments/:cid ──────────────────
router.delete('/:id/comments/:cid', async (req, res, next) => {
  try {
    const [rows] = await pool.query('SELECT user_id FROM comments WHERE id = ?', [req.params.cid])
    const comment = (rows as Record<string, unknown>[])[0]
    if (!comment)                             { res.status(404).json({ success: false, error: '댓글을 찾을 수 없습니다.' }); return }
    if (comment.user_id !== req.user!.id)     { res.status(403).json({ success: false, error: '권한이 없습니다.' }); return }
    await pool.query('DELETE FROM comments WHERE id = ?', [req.params.cid])
    res.json({ success: true, message: '댓글이 삭제되었습니다.' })
  } catch (err) { next(err) }
})

export default router
