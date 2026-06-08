/**
 * 대시보드 통계 라우트: /api/stats
 * GET / - 내 통계 요약
 */
import { Router } from 'express'
import { authenticate } from '../middlewares/auth'
import { pool } from '../config/database'

const router = Router()
router.use(authenticate)

router.get('/', async (req, res, next) => {
  try {
    const id = req.user!.id
    const [[totalTracks]]  = await pool.query("SELECT COUNT(*) as c FROM tracks WHERE user_id = ?", [id]) as unknown[][]
    const [[totalPlays]]   = await pool.query("SELECT COALESCE(SUM(play_count),0) as s FROM tracks WHERE user_id = ?", [id]) as unknown[][]
    const [[libraryCount]] = await pool.query("SELECT COUNT(*) as c FROM tracks WHERE user_id = ? AND status = 'done'", [id]) as unknown[][]
    const [[creditRow]]    = await pool.query("SELECT balance FROM credit_history WHERE user_id = ? ORDER BY created_at DESC LIMIT 1", [id]) as unknown[][]
    const [[weekTracks]]   = await pool.query(
      "SELECT COUNT(*) as c FROM tracks WHERE user_id = ? AND created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)", [id]
    ) as unknown[][]
    const [[weekPlays]]    = await pool.query(
      "SELECT COALESCE(SUM(play_count),0) as s FROM tracks WHERE user_id = ? AND created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)", [id]
    ) as unknown[][]

    res.json({ success: true, data: {
      totalTracks:      (totalTracks  as Record<string, unknown>).c,
      creditsRemaining: (creditRow    as Record<string, unknown>)?.balance ?? 0,
      totalPlays:       (totalPlays   as Record<string, unknown>).s,
      libraryCount:     (libraryCount as Record<string, unknown>).c,
      weeklyChange: {
        tracks: (weekTracks as Record<string, unknown>).c,
        plays:  (weekPlays  as Record<string, unknown>).s,
      },
    }})
  } catch (err) { next(err) }
})

export default router
