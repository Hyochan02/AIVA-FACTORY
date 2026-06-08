/**
 * 크레딧 라우트: /api/credits
 * GET /         - 크레딧 현황
 * GET /history  - 사용 내역
 */
import { Router } from 'express'
import { authenticate } from '../middlewares/auth'
import { pool } from '../config/database'

const router = Router()
router.use(authenticate)

router.get('/', async (req, res, next) => {
  try {
    const [[row]] = await pool.query(
      'SELECT balance, created_at FROM credit_history WHERE user_id = ? ORDER BY created_at DESC LIMIT 1',
      [req.user!.id]
    ) as unknown[][]
    const [[userRow]] = await pool.query('SELECT plan FROM users WHERE id = ?', [req.user!.id]) as unknown[][]
    const planCredits: Record<string, number> = { free: 100, pro: 500, enterprise: -1 }

    res.json({ success: true, data: {
      balance:      (row as Record<string, unknown>)?.balance ?? 0,
      plan:         (userRow as Record<string, unknown>)?.plan ?? 'free',
      monthlyGrant: planCredits[(userRow as Record<string, unknown>)?.plan as string ?? 'free'],
    }})
  } catch (err) { next(err) }
})

router.get('/history', async (req, res, next) => {
  try {
    const { page = 1, limit = 20, type } = req.query
    const offset = (Number(page) - 1) * Number(limit)

    let where = 'WHERE user_id = ?'
    const params: unknown[] = [req.user!.id]
    if (type) { where += ' AND type = ?'; params.push(type) }

    const [items] = await pool.query(
      `SELECT * FROM credit_history ${where} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
      [...params, Number(limit), offset]
    )
    const [[count]] = await pool.query(`SELECT COUNT(*) as total FROM credit_history ${where}`, params) as unknown[][]
    const total = (count as Record<string, unknown>).total as number

    res.json({ success: true, data: { items, pagination: { page: Number(page), limit: Number(limit), total, totalPages: Math.ceil(total / Number(limit)) } } })
  } catch (err) { next(err) }
})

export default router
