/**
 * 탐색·커뮤니티 라우트: /api/explore
 * GET /trending  - 인기 트랙
 * GET /recent    - 최신 공개 트랙
 * GET /creators  - 인기 크리에이터
 * GET /search    - 통합 검색
 */
import { Router } from 'express'
import { pool } from '../config/database'

const router = Router()

// ── GET /api/explore/trending ──────────────────────────────
router.get('/trending', async (req, res, next) => {
  try {
    const { genre, period = 'week', page = 1, limit = 20 } = req.query
    const offset = (Number(page) - 1) * Number(limit)

    const periodDays: Record<string, number> = { day: 1, week: 7, month: 30 }
    const days = periodDays[period as string] ?? 7

    let where = `WHERE is_public = 1 AND status = 'done' AND created_at >= DATE_SUB(NOW(), INTERVAL ${days} DAY)`
    const params: unknown[] = []
    if (genre) { where += ' AND genre = ?'; params.push(genre) }

    const [items] = await pool.query(
      `SELECT t.*, u.name as owner_name, u.avatar_url as owner_avatar,
              (@rank := @rank + 1) as rank
       FROM tracks t
       JOIN users u ON t.user_id = u.id,
       (SELECT @rank := ${offset}) r
       ${where}
       ORDER BY (t.play_count * 1 + t.like_count * 3) DESC
       LIMIT ? OFFSET ?`,
      [...params, Number(limit), offset]
    )

    res.json({ success: true, data: { items } })
  } catch (err) { next(err) }
})

// ── GET /api/explore/recent ────────────────────────────────
router.get('/recent', async (req, res, next) => {
  try {
    const { genre, page = 1, limit = 20 } = req.query
    const offset = (Number(page) - 1) * Number(limit)

    let where = `WHERE t.is_public = 1 AND t.status = 'done'`
    const params: unknown[] = []
    if (genre) { where += ' AND t.genre = ?'; params.push(genre) }

    const [items] = await pool.query(
      `SELECT t.*, u.name as owner_name, u.avatar_url as owner_avatar
       FROM tracks t JOIN users u ON t.user_id = u.id
       ${where}
       ORDER BY t.created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, Number(limit), offset]
    )

    res.json({ success: true, data: { items } })
  } catch (err) { next(err) }
})

// ── GET /api/explore/creators ──────────────────────────────
router.get('/creators', async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query
    const offset = (Number(page) - 1) * Number(limit)

    const [items] = await pool.query(
      `SELECT u.id, u.name, u.avatar_url,
              COUNT(DISTINCT t.id)  as track_count,
              COALESCE(SUM(t.play_count),0) as total_plays,
              (SELECT COUNT(*) FROM follows WHERE following_id = u.id) as followers
       FROM users u
       LEFT JOIN tracks t ON t.user_id = u.id AND t.is_public = 1
       WHERE u.is_active = 1
       GROUP BY u.id
       ORDER BY total_plays DESC
       LIMIT ? OFFSET ?`,
      [Number(limit), offset]
    )

    res.json({ success: true, data: { items } })
  } catch (err) { next(err) }
})

// ── GET /api/explore/search ────────────────────────────────
router.get('/search', async (req, res, next) => {
  try {
    const { q, type = 'all', page = 1, limit = 20 } = req.query
    if (!q) { res.status(400).json({ success: false, error: '검색어를 입력해주세요.' }); return }

    const offset = (Number(page) - 1) * Number(limit)
    const result: Record<string, unknown> = {}

    if (type === 'tracks' || type === 'all') {
      const [tracks] = await pool.query(
        `SELECT t.*, u.name as owner_name FROM tracks t JOIN users u ON t.user_id = u.id
         WHERE t.is_public = 1 AND t.status = 'done' AND (t.title LIKE ? OR t.genre LIKE ?)
         ORDER BY t.play_count DESC LIMIT ? OFFSET ?`,
        [`%${q}%`, `%${q}%`, Number(limit), offset]
      )
      result.tracks = tracks
    }

    if (type === 'users' || type === 'all') {
      const [users] = await pool.query(
        `SELECT id, name, avatar_url FROM users WHERE name LIKE ? AND is_active = 1 LIMIT ? OFFSET ?`,
        [`%${q}%`, Number(limit), offset]
      )
      result.users = users
    }

    res.json({ success: true, data: result })
  } catch (err) { next(err) }
})

export default router
