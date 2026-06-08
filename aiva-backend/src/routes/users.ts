/**
 * 유저·크리에이터 라우트: /api/users
 * GET    /:id          - 공개 프로필
 * POST   /:id/follow   - 팔로우
 * DELETE /:id/follow   - 언팔로우
 * GET    /:id/followers - 팔로워 목록
 * GET    /:id/following - 팔로잉 목록
 */
import { Router } from 'express'
import { authenticate } from '../middlewares/auth'
import { pool } from '../config/database'

const router = Router()

router.get('/:id', async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, name, avatar_url, plan, created_at FROM users WHERE id = ? AND is_active = 1',
      [req.params.id]
    )
    const user = (rows as Record<string, unknown>[])[0]
    if (!user) { res.status(404).json({ success: false, error: '유저를 찾을 수 없습니다.' }); return }

    const [[trackCount]] = await pool.query("SELECT COUNT(*) as c FROM tracks WHERE user_id = ? AND is_public = 1", [req.params.id]) as unknown[][]
    const [[followers]]  = await pool.query("SELECT COUNT(*) as c FROM follows WHERE following_id = ?", [req.params.id]) as unknown[][]
    const [[following]]  = await pool.query("SELECT COUNT(*) as c FROM follows WHERE follower_id = ?",  [req.params.id]) as unknown[][]
    const [publicTracks] = await pool.query(
      "SELECT * FROM tracks WHERE user_id = ? AND is_public = 1 AND status = 'done' ORDER BY created_at DESC LIMIT 10",
      [req.params.id]
    )

    res.json({ success: true, data: {
      ...user,
      stats: {
        tracks:    (trackCount as Record<string, unknown>).c,
        followers: (followers  as Record<string, unknown>).c,
        following: (following  as Record<string, unknown>).c,
      },
      recentTracks: publicTracks,
    }})
  } catch (err) { next(err) }
})

router.post('/:id/follow', authenticate, async (req, res, next) => {
  try {
    if (req.params.id === req.user!.id) { res.status(400).json({ success: false, error: '자기 자신을 팔로우할 수 없습니다.' }); return }
    await pool.query(
      'INSERT IGNORE INTO follows (follower_id, following_id) VALUES (?, ?)',
      [req.user!.id, req.params.id]
    )
    res.json({ success: true, message: '팔로우했습니다.' })
  } catch (err) { next(err) }
})

router.delete('/:id/follow', authenticate, async (req, res, next) => {
  try {
    await pool.query('DELETE FROM follows WHERE follower_id = ? AND following_id = ?', [req.user!.id, req.params.id])
    res.json({ success: true, message: '언팔로우했습니다.' })
  } catch (err) { next(err) }
})

router.get('/:id/followers', async (req, res, next) => {
  try {
    const [items] = await pool.query(
      `SELECT u.id, u.name, u.avatar_url FROM follows f JOIN users u ON f.follower_id = u.id
       WHERE f.following_id = ? ORDER BY f.created_at DESC LIMIT 50`,
      [req.params.id]
    )
    res.json({ success: true, data: { items } })
  } catch (err) { next(err) }
})

router.get('/:id/following', async (req, res, next) => {
  try {
    const [items] = await pool.query(
      `SELECT u.id, u.name, u.avatar_url FROM follows f JOIN users u ON f.following_id = u.id
       WHERE f.follower_id = ? ORDER BY f.created_at DESC LIMIT 50`,
      [req.params.id]
    )
    res.json({ success: true, data: { items } })
  } catch (err) { next(err) }
})

export default router
