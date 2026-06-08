/**
 * 탐색·커뮤니티 라우트: /api/explore
 * GET /trending  - 인기 트랙 (+ is_liked, 실제 duration)
 * GET /recent    - 최신 공개 트랙 (+ is_liked, 실제 duration)
 * GET /creators  - 인기 크리에이터 (+ is_following)
 * GET /search    - 통합 검색
 *
 * 모두 optionalAuthenticate 사용:
 *   - 비로그인 → is_liked=0, is_following=0
 *   - 로그인 → DB 서브쿼리로 실제 값 반환
 */
import { Router } from 'express'
import { pool } from '../config/database'
import { optionalAuthenticate } from '../middlewares/auth'

const router = Router()
router.use(optionalAuthenticate)

// ── 공통: 실제 duration 서브쿼리 ─────────────────────────────
// tracks.duration은 요청 시 입력값, track_versions.duration이 Suno 실제 출력 길이
// COALESCE로 track_versions 우선, 없으면 tracks.duration 폴백
const DURATION_SUBQ = `
  COALESCE(
    (SELECT MAX(tv.duration) FROM track_versions tv WHERE tv.track_id = t.id AND tv.duration IS NOT NULL),
    t.duration
  ) AS duration`

// ── GET /api/explore/trending ──────────────────────────────
router.get('/trending', async (req, res, next) => {
  try {
    const { genre, period = 'week', page = 1, limit = 20 } = req.query
    const offset = (Number(page) - 1) * Number(limit)
    const days = ({ day: 1, week: 7, month: 30 } as Record<string, number>)[period as string] ?? 7
    const userId = req.user?.id ?? null

    let where = `WHERE t.is_public = 1 AND t.status = 'done' AND t.created_at >= DATE_SUB(NOW(), INTERVAL ${days} DAY)`
    const params: unknown[] = []
    if (genre) { where += ' AND t.genre = ?'; params.push(genre) }

    const [items] = await pool.query(
      `SELECT t.id, t.title, t.prompt, t.genre, t.mood, t.status,
              t.audio_url, t.cover_url, t.created_at, t.is_public,
              t.like_count, t.play_count AS plays,
              ${DURATION_SUBQ},
              u.name AS owner_name, u.avatar_url AS owner_avatar,
              CASE WHEN ? IS NOT NULL
                THEN (SELECT COUNT(*) FROM likes l WHERE l.track_id = t.id AND l.user_id = ?)
                ELSE 0
              END AS is_liked
       FROM tracks t
       JOIN users u ON t.user_id = u.id
       ${where}
       ORDER BY (t.play_count * 1 + t.like_count * 3) DESC
       LIMIT ? OFFSET ?`,
      [userId, userId, ...params, Number(limit), offset]
    )

    res.json({ success: true, data: { items } })
  } catch (err) { next(err) }
})

// ── GET /api/explore/recent ────────────────────────────────
router.get('/recent', async (req, res, next) => {
  try {
    const { genre, page = 1, limit = 20 } = req.query
    const offset = (Number(page) - 1) * Number(limit)
    const userId = req.user?.id ?? null

    let where = `WHERE t.is_public = 1 AND t.status = 'done'`
    const params: unknown[] = []
    if (genre) { where += ' AND t.genre = ?'; params.push(genre) }

    const [items] = await pool.query(
      `SELECT t.id, t.title, t.prompt, t.genre, t.mood, t.status,
              t.audio_url, t.cover_url, t.created_at, t.is_public,
              t.like_count, t.play_count AS plays,
              ${DURATION_SUBQ},
              u.name AS owner_name, u.avatar_url AS owner_avatar,
              CASE WHEN ? IS NOT NULL
                THEN (SELECT COUNT(*) FROM likes l WHERE l.track_id = t.id AND l.user_id = ?)
                ELSE 0
              END AS is_liked
       FROM tracks t JOIN users u ON t.user_id = u.id
       ${where}
       ORDER BY t.created_at DESC
       LIMIT ? OFFSET ?`,
      [userId, userId, ...params, Number(limit), offset]
    )

    res.json({ success: true, data: { items } })
  } catch (err) { next(err) }
})

// ── GET /api/explore/creators ──────────────────────────────
router.get('/creators', async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query
    const offset = (Number(page) - 1) * Number(limit)
    const userId = req.user?.id ?? null

    const [items] = await pool.query(
      `SELECT u.id, u.name, u.avatar_url,
              COUNT(DISTINCT t.id)            AS track_count,
              COALESCE(SUM(t.play_count), 0)  AS total_plays,
              (SELECT COUNT(*) FROM follows WHERE following_id = u.id) AS followers,
              CASE WHEN ? IS NOT NULL
                THEN (SELECT COUNT(*) FROM follows f2 WHERE f2.follower_id = ? AND f2.following_id = u.id)
                ELSE 0
              END AS is_following
       FROM users u
       LEFT JOIN tracks t ON t.user_id = u.id AND t.is_public = 1
       WHERE u.is_active = 1
       GROUP BY u.id
       ORDER BY total_plays DESC
       LIMIT ? OFFSET ?`,
      [userId, userId, Number(limit), offset]
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
    const userId = req.user?.id ?? null
    const result: Record<string, unknown> = {}

    if (type === 'tracks' || type === 'all') {
      const [tracks] = await pool.query(
        `SELECT t.id, t.title, t.genre, t.mood, t.status,
                t.like_count, t.play_count AS plays,
                ${DURATION_SUBQ},
                u.name AS owner_name,
                CASE WHEN ? IS NOT NULL
                  THEN (SELECT COUNT(*) FROM likes l WHERE l.track_id = t.id AND l.user_id = ?)
                  ELSE 0
                END AS is_liked
         FROM tracks t JOIN users u ON t.user_id = u.id
         WHERE t.is_public = 1 AND t.status = 'done' AND (t.title LIKE ? OR t.genre LIKE ?)
         ORDER BY t.play_count DESC LIMIT ? OFFSET ?`,
        [userId, userId, `%${q}%`, `%${q}%`, Number(limit), offset]
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
