import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'

// Express Request 타입 확장 (TypeScript 패턴)
declare global {
  namespace Express {
    interface Request {
      user?: { id: string; email: string; plan: string }
    }
  }
}

/**
 * JWT 인증 미들웨어
 * Best Practice: Authorization 헤더에서 Bearer 토큰 추출 후 검증
 * 인증 실패 시 401, 권한 없음 시 403 반환
 */
export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization
  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({ success: false, error: '인증 토큰이 필요합니다' })
    return
  }

  const token = authHeader.split(' ')[1]
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      id: string; email: string; plan: string
    }
    req.user = decoded
    next()
  } catch {
    res.status(401).json({ success: false, error: '유효하지 않은 토큰입니다' })
  }
}

/**
 * 선택적 JWT 인증 미들웨어
 * 토큰이 있으면 req.user 세팅, 없거나 유효하지 않으면 그냥 통과
 * Explore처럼 비로그인도 볼 수 있지만 로그인 시 is_liked/is_following 등을 반환할 때 사용
 */
export const optionalAuthenticate = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization
  if (!authHeader?.startsWith('Bearer ')) { next(); return }

  const token = authHeader.split(' ')[1]
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      id: string; email: string; plan: string
    }
    req.user = decoded
  } catch {
    // 토큰이 유효하지 않아도 403이 아니라 그냥 통과 (비로그인 취급)
  }
  next()
}
