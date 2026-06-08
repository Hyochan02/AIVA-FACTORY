/**
 * 구독·결제 라우트: /api/subscriptions
 * GET    /plans    - 요금제 목록
 * GET    /current  - 현재 구독 조회
 * POST   /         - 구독 시작
 * DELETE /current  - 구독 취소
 */
import { Router } from 'express'
import { authenticate } from '../middlewares/auth'
import { pool } from '../config/database'
import { v4 as uuidv4 } from 'uuid'

const router = Router()

const PLANS = [
  {
    id: 'free', name: 'Free',
    price: { monthly: 0, yearly: 0 }, credits: 100,
    features: ['MP3 다운로드', '월 100 크레딧', '기본 에디터', '커뮤니티 탐색'],
    limits: { wav: false, stems: false, commercial: false },
  },
  {
    id: 'pro', name: 'Pro',
    price: { monthly: 19000, yearly: 15000 }, credits: 500,
    features: ['WAV 24bit/48kHz', '스템 ZIP 다운로드', '상업적 이용', '월 500 크레딧', '고급 에디터', '우선 처리'],
    limits: { wav: true, stems: true, commercial: true },
  },
  {
    id: 'enterprise', name: 'Enterprise',
    price: { monthly: 79000, yearly: 65000 }, credits: -1,
    features: ['무제한 크레딧', '모든 Pro 기능', 'API 무제한', '팀 계정 (5인)', '전담 CS', 'SLA 99.9%'],
    limits: { wav: true, stems: true, commercial: true },
  },
]

router.get('/plans', (_req, res) => {
  res.json({ success: true, data: PLANS })
})

router.get('/current', authenticate, async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM subscriptions WHERE user_id = ? AND status = "active" ORDER BY created_at DESC LIMIT 1',
      [req.user!.id]
    )
    const sub = (rows as Record<string, unknown>[])[0]
    const [[userRow]] = await pool.query('SELECT plan FROM users WHERE id = ?', [req.user!.id]) as unknown[][]

    res.json({ success: true, data: {
      plan:               (userRow as Record<string, unknown>)?.plan ?? 'free',
      status:             sub?.status ?? 'active',
      currentPeriodEnd:   sub?.current_period_end ?? null,
      cancelAtPeriodEnd:  sub?.cancel_at_period_end ?? false,
    }})
  } catch (err) { next(err) }
})

router.post('/', authenticate, async (req, res, next) => {
  try {
    const { planId, billing = 'monthly' } = req.body
    if (!['pro', 'enterprise'].includes(planId)) { res.status(400).json({ success: false, error: '올바른 플랜을 선택해주세요.' }); return }

    // TODO: Toss Payments / Stripe 결제 처리
    // const paymentResult = await processPayment(req.body.paymentMethodId, PLANS.find(p => p.id === planId).price[billing])

    const conn = await pool.getConnection()
    try {
      await conn.query("UPDATE users SET plan = ? WHERE id = ?", [planId, req.user!.id])

      const periodEnd = new Date()
      periodEnd.setMonth(periodEnd.getMonth() + (billing === 'yearly' ? 12 : 1))
      await conn.query(
        'INSERT INTO subscriptions (id, user_id, plan, billing_cycle, current_period_end) VALUES (?, ?, ?, ?, ?)',
        [uuidv4(), req.user!.id, planId, billing, periodEnd]
      )

      // 크레딧 즉시 지급
      const planCredits: Record<string, number> = { pro: 500, enterprise: 9999 }
      const [[creditRow]] = await conn.query(
        'SELECT balance FROM credit_history WHERE user_id = ? ORDER BY created_at DESC LIMIT 1', [req.user!.id]
      ) as unknown[][]
      const balance = ((creditRow as Record<string, unknown>)?.balance as number) ?? 0
      const grant = planCredits[planId] ?? 0
      await conn.query(
        'INSERT INTO credit_history (id, user_id, type, amount, balance, description) VALUES (?, ?, ?, ?, ?, ?)',
        [uuidv4(), req.user!.id, 'grant', grant, balance + grant, `${planId} 플랜 구독 크레딧`]
      )

      res.status(201).json({ success: true, message: `${planId} 플랜 구독이 시작되었습니다.` })
    } finally { conn.release() }
  } catch (err) { next(err) }
})

router.delete('/current', authenticate, async (req, res, next) => {
  try {
    await pool.query(
      "UPDATE subscriptions SET cancel_at_period_end = 1 WHERE user_id = ? AND status = 'active'",
      [req.user!.id]
    )
    res.json({ success: true, message: '구독 기간 만료 후 자동으로 해지됩니다.' })
  } catch (err) { next(err) }
})

export default router
