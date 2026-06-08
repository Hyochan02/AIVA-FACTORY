/**
 * AIVA FACTORY · Express App 설정
 * 미들웨어 등록 순서: helmet → cors → rate-limit → morgan → routes → error handler
 */
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import rateLimit from 'express-rate-limit'

import authRouter         from './routes/auth'
import tracksRouter       from './routes/tracks'
import generateRouter     from './routes/generate'
import exploreRouter      from './routes/explore'
import usersRouter        from './routes/users'
import creditsRouter      from './routes/credits'
import subscriptionsRouter from './routes/subscriptions'
import notificationsRouter from './routes/notifications'
import statsRouter        from './routes/stats'
import { errorHandler }   from './middlewares/errorHandler'
import { notFound }       from './middlewares/notFound'

const app = express()

// ── 보안 헤더 (XSS, Clickjacking 등 자동 방어) ──────────────
app.use(helmet())

// ── CORS ────────────────────────────────────────────────────
const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'http://localhost:5173').split(',')
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) callback(null, true)
    else callback(new Error(`CORS: ${origin} not allowed`))
  },
  credentials: true,
}))

// ── Rate Limiting ────────────────────────────────────────────
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { success: false, error: '요청이 너무 많습니다. 잠시 후 다시 시도해주세요.' },
})
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { success: false, error: '너무 많은 인증 시도입니다. 잠시 후 다시 시도해주세요.' },
})
app.use('/api', generalLimiter)
app.use('/api/auth', authLimiter)

// ── 파싱 ────────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))

// ── 로깅 ────────────────────────────────────────────────────
if (process.env.NODE_ENV !== 'test') app.use(morgan('dev'))

// ── 헬스체크 ─────────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), env: process.env.NODE_ENV })
})

// ── API 라우트 ────────────────────────────────────────────────
app.use('/api/auth',          authRouter)
app.use('/api/generate',      generateRouter)       // 음악 생성 (Suno AI)
app.use('/api/tracks',        tracksRouter)          // 트랙 CRUD + 좋아요 + 댓글
app.use('/api/explore',       exploreRouter)         // 탐색·커뮤니티
app.use('/api/users',         usersRouter)           // 유저 프로필·팔로우
app.use('/api/credits',       creditsRouter)         // 크레딧 현황·이용내역
app.use('/api/subscriptions', subscriptionsRouter)   // 구독·결제
app.use('/api/notifications', notificationsRouter)   // 알림 설정
app.use('/api/stats',         statsRouter)           // 대시보드 통계

// ── 에러 핸들러 ───────────────────────────────────────────────
app.use(notFound)
app.use(errorHandler)

export default app
