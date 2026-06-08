/**
 * 인증 라우트: /api/auth
 * POST /register  - 회원가입 (이메일 중복확인 → bcrypt → JWT)
 * POST /login     - 로그인 (bcrypt 검증 → JWT)
 * POST /social    - 소셜 로그인 (Google / Facebook)
 * GET  /me        - 내 정보 조회
 * PUT  /me        - 프로필 수정
 * PUT  /password  - 비밀번호 변경
 */
import { Router } from 'express'
import { z } from 'zod'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { authenticate } from '../middlewares/auth'
import { pool } from '../config/database'
import { v4 as uuidv4 } from 'uuid'

const router = Router()

// ── 유효성 스키마 ──────────────────────────────────────────
const registerSchema = z.object({
  name:     z.string().min(2).max(50),
  email:    z.string().email(),
  password: z.string().min(8),
  useCases: z.array(z.string()).optional(),
})
const loginSchema = z.object({
  email:    z.string().email(),
  password: z.string().min(1),
})
const socialSchema = z.object({
  provider:    z.enum(['google', 'facebook']),
  accessToken: z.string(),
})

// ── JWT 발급 헬퍼 ─────────────────────────────────────────
function signToken(payload: object) {
  return jwt.sign(payload, process.env.JWT_SECRET!, { expiresIn: '7d' })
}

// ── POST /api/auth/register ────────────────────────────────
router.post('/register', async (req, res, next) => {
  try {
    const body = registerSchema.parse(req.body)
    const conn = await pool.getConnection()
    try {
      // 1. 이메일 중복 확인
      const [rows] = await conn.query('SELECT id FROM users WHERE email = ?', [body.email])
      if ((rows as unknown[]).length > 0) {
        res.status(409).json({ success: false, error: '이미 가입된 이메일입니다.', code: 'EMAIL_DUPLICATED' })
        return
      }

      // 2. 비밀번호 해시
      const hash = await bcrypt.hash(body.password, 12)
      const userId = uuidv4()

      // 3. 유저 생성
      await conn.query(
        'INSERT INTO users (id, email, password, name) VALUES (?, ?, ?, ?)',
        [userId, body.email, hash, body.name]
      )

      // 4. 크레딧 100 지급
      const creditId = uuidv4()
      await conn.query(
        'INSERT INTO credit_history (id, user_id, type, amount, balance, description) VALUES (?, ?, ?, ?, ?, ?)',
        [creditId, userId, 'grant', 100, 100, '가입 축하 크레딧']
      )

      // 5. 알림 기본 설정 생성
      await conn.query('INSERT INTO notification_settings (user_id) VALUES (?)', [userId])

      // 6. 사용 용도 저장
      if (body.useCases?.length) {
        await conn.query(
          'INSERT INTO user_preferences (user_id, use_cases) VALUES (?, ?)',
          [userId, JSON.stringify(body.useCases)]
        )
      }

      const token = signToken({ id: userId, email: body.email, plan: 'free' })
      res.status(201).json({
        success: true,
        data: { token, user: { id: userId, email: body.email, name: body.name, plan: 'free', credits: 100 } },
      })
    } finally {
      conn.release()
    }
  } catch (err) {
    next(err)
  }
})

// ── POST /api/auth/login ───────────────────────────────────
router.post('/login', async (req, res, next) => {
  try {
    const body = loginSchema.parse(req.body)
    const conn = await pool.getConnection()
    try {
      const [rows] = await conn.query('SELECT * FROM users WHERE email = ?', [body.email])
      const user = (rows as Record<string, unknown>[])[0]
      if (!user) {
        res.status(401).json({ success: false, error: '이메일 또는 비밀번호가 올바르지 않습니다.', code: 'INVALID_CREDENTIALS' })
        return
      }
      if (!user.is_active) {
        res.status(403).json({ success: false, error: '정지된 계정입니다.', code: 'ACCOUNT_SUSPENDED' })
        return
      }
      const valid = await bcrypt.compare(body.password, user.password as string)
      if (!valid) {
        res.status(401).json({ success: false, error: '이메일 또는 비밀번호가 올바르지 않습니다.', code: 'INVALID_CREDENTIALS' })
        return
      }

      // 크레딧 잔액 조회
      const [creditRows] = await conn.query(
        'SELECT balance FROM credit_history WHERE user_id = ? ORDER BY created_at DESC LIMIT 1',
        [user.id]
      )
      const credits = ((creditRows as Record<string, unknown>[])[0]?.balance as number) ?? 0

      const token = signToken({ id: user.id, email: user.email, plan: user.plan })
      res.json({
        success: true,
        data: { token, user: { id: user.id, email: user.email, name: user.name, plan: user.plan, credits } },
      })
    } finally {
      conn.release()
    }
  } catch (err) {
    next(err)
  }
})

// ── POST /api/auth/social ──────────────────────────────────
router.post('/social', async (req, res, next) => {
  try {
    const body = socialSchema.parse(req.body)
    // TODO: provider별 토큰 검증 후 유저 정보 조회
    // Google: https://www.googleapis.com/oauth2/v3/userinfo
    // Facebook: https://graph.facebook.com/me
    console.log('[TODO] 소셜 로그인:', body.provider)
    res.status(501).json({ success: false, error: '소셜 로그인은 2차 개발에서 구현됩니다.' })
  } catch (err) {
    next(err)
  }
})

// ── GET /api/auth/me ───────────────────────────────────────
router.get('/me', authenticate, async (req, res, next) => {
  try {
    const conn = await pool.getConnection()
    try {
      const [rows] = await conn.query(
        'SELECT id, email, name, avatar_url, plan, created_at FROM users WHERE id = ?',
        [req.user!.id]
      )
      const user = (rows as Record<string, unknown>[])[0]
      if (!user) { res.status(404).json({ success: false, error: '유저를 찾을 수 없습니다.' }); return }

      // 통계
      const [[trackCount]] = await conn.query('SELECT COUNT(*) as c FROM tracks WHERE user_id = ?', [user.id]) as unknown[][]
      const [[playSum]]    = await conn.query('SELECT COALESCE(SUM(play_count),0) as s FROM tracks WHERE user_id = ?', [user.id]) as unknown[][]
      const [[creditRow]]  = await conn.query(
        'SELECT balance FROM credit_history WHERE user_id = ? ORDER BY created_at DESC LIMIT 1', [user.id]
      ) as unknown[][]

      res.json({ success: true, data: {
        ...user,
        credits: (creditRow as Record<string, unknown>)?.balance ?? 0,
        stats: {
          totalTracks: (trackCount as Record<string, unknown>).c,
          totalPlays:  (playSum   as Record<string, unknown>).s,
        },
      }})
    } finally { conn.release() }
  } catch (err) { next(err) }
})

// ── PUT /api/auth/me ───────────────────────────────────────
router.put('/me', authenticate, async (req, res, next) => {
  try {
    const { name } = req.body
    if (!name) { res.status(400).json({ success: false, error: '수정할 정보를 입력해주세요.' }); return }
    await pool.query('UPDATE users SET name = ? WHERE id = ?', [name, req.user!.id])
    res.json({ success: true, message: '프로필이 업데이트되었습니다.' })
  } catch (err) { next(err) }
})

// ── PUT /api/auth/password ─────────────────────────────────
router.put('/password', authenticate, async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body
    if (!currentPassword || !newPassword) { res.status(400).json({ success: false, error: '비밀번호를 입력해주세요.' }); return }
    if (newPassword.length < 8) { res.status(400).json({ success: false, error: '새 비밀번호는 8자 이상이어야 합니다.' }); return }

    const conn = await pool.getConnection()
    try {
      const [rows] = await conn.query('SELECT password FROM users WHERE id = ?', [req.user!.id])
      const user = (rows as Record<string, unknown>[])[0]
      const valid = await bcrypt.compare(currentPassword, user.password as string)
      if (!valid) { res.status(401).json({ success: false, error: '현재 비밀번호가 올바르지 않습니다.' }); return }

      const hash = await bcrypt.hash(newPassword, 12)
      await conn.query('UPDATE users SET password = ? WHERE id = ?', [hash, req.user!.id])
      res.json({ success: true, message: '비밀번호가 변경되었습니다.' })
    } finally { conn.release() }
  } catch (err) { next(err) }
})

export default router

// ── POST /api/auth/forgot-password ────────────────────────
// 이메일로 비밀번호 재설정 토큰 발송
router.post('/forgot-password', async (req, res, next) => {
  try {
    const { email } = req.body
    if (!email) { res.status(400).json({ success: false, error: '이메일을 입력해주세요.' }); return }

    const conn = await pool.getConnection()
    try {
      const [rows] = await conn.query('SELECT id FROM users WHERE email = ?', [email])
      const user = (rows as Record<string, unknown>[])[0]

      // 보안: 이메일 존재 여부와 관계없이 동일한 응답 반환 (이메일 열거 공격 방지)
      if (user) {
        const token   = uuidv4()
        const expires = new Date(Date.now() + 60 * 60 * 1000) // 1시간
        await conn.query(
          'DELETE FROM password_resets WHERE user_id = ?',
          [user.id]
        )
        await conn.query(
          `INSERT INTO password_resets (id, user_id, token, expires_at) VALUES (?, ?, ?, ?)`,
          [uuidv4(), user.id, token, expires]
        )
        // TODO: 실제 이메일 발송 (SendGrid / AWS SES)
        // 현재는 개발용으로 토큰을 응답에 포함 (프로덕션에서는 제거 필요)
        if (process.env.NODE_ENV === 'development') {
          res.json({ success: true, message: '비밀번호 재설정 링크가 발송되었습니다.', _devToken: token })
          return
        }
      }

      res.json({ success: true, message: '입력하신 이메일로 재설정 링크를 발송했습니다.' })
    } finally { conn.release() }
  } catch (err) { next(err) }
})

// ── POST /api/auth/reset-password ─────────────────────────
// 토큰으로 비밀번호 재설정
router.post('/reset-password', async (req, res, next) => {
  try {
    const { token, newPassword } = req.body
    if (!token || !newPassword) {
      res.status(400).json({ success: false, error: '토큰과 새 비밀번호를 입력해주세요.' })
      return
    }
    if (newPassword.length < 8) {
      res.status(400).json({ success: false, error: '비밀번호는 8자 이상이어야 합니다.' })
      return
    }

    const conn = await pool.getConnection()
    try {
      const [rows] = await conn.query(
        "SELECT * FROM password_resets WHERE token = ? AND used = 0 AND expires_at > NOW()",
        [token]
      )
      const reset = (rows as Record<string, unknown>[])[0]
      if (!reset) {
        res.status(400).json({ success: false, error: '유효하지 않거나 만료된 링크입니다.' })
        return
      }

      const hash = await bcrypt.hash(newPassword, 12)
      await conn.query('UPDATE users SET password = ? WHERE id = ?', [hash, reset.user_id])
      await conn.query('UPDATE password_resets SET used = 1 WHERE id = ?', [reset.id])
      res.json({ success: true, message: '비밀번호가 성공적으로 변경되었습니다.' })
    } finally { conn.release() }
  } catch (err) { next(err) }
})
