/**
 * 알림 설정 라우트: /api/notifications
 * GET /settings  - 알림 설정 조회
 * PUT /settings  - 알림 설정 변경
 */
import { Router } from 'express'
import { authenticate } from '../middlewares/auth'
import { pool } from '../config/database'

const router = Router()
router.use(authenticate)

router.get('/settings', async (req, res, next) => {
  try {
    const [rows] = await pool.query('SELECT * FROM notification_settings WHERE user_id = ?', [req.user!.id])
    const settings = (rows as Record<string, unknown>[])[0] ?? { gen: true, credit: true, like: false, follow: false, marketing: false }
    const { user_id: _, ...rest } = settings
    res.json({ success: true, data: rest })
  } catch (err) { next(err) }
})

router.put('/settings', async (req, res, next) => {
  try {
    const allowed = ['gen', 'credit', 'like', 'follow', 'marketing']
    const fields: string[] = []
    const vals: unknown[]  = []

    for (const key of allowed) {
      if (req.body[key] !== undefined) {
        fields.push(`\`${key}\` = ?`)
        vals.push(req.body[key] ? 1 : 0)
      }
    }
    if (!fields.length) { res.status(400).json({ success: false, error: '변경할 설정이 없습니다.' }); return }

    vals.push(req.user!.id)
    await pool.query(
      `INSERT INTO notification_settings (user_id) VALUES (?) ON DUPLICATE KEY UPDATE ${fields.join(', ')}`,
      [req.user!.id, ...vals.slice(0, vals.length - 1), ...vals.slice(vals.length - 1)]
    )
    // 간단하게 upsert
    await pool.query(`UPDATE notification_settings SET ${fields.join(', ')} WHERE user_id = ?`, vals)
    res.json({ success: true, message: '알림 설정이 변경되었습니다.' })
  } catch (err) { next(err) }
})

export default router
