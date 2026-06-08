import { Request, Response, NextFunction } from 'express'

/**
 * 글로벌 에러 핸들러
 * Best Practice: 에러를 한 곳에서 처리해 일관된 응답 포맷 유지
 * 운영 환경에서는 스택 트레이스를 숨깁니다 (보안)
 */
export const errorHandler = (
  err: Error & { statusCode?: number },
  _req: Request,
  res: Response,
  _next: NextFunction,
) => {
  const statusCode = err.statusCode ?? 500
  const message = err.message ?? '서버 오류가 발생했습니다'

  console.error(`[ERROR] ${statusCode} - ${message}`, err.stack)

  res.status(statusCode).json({
    success: false,
    error: message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  })
}
