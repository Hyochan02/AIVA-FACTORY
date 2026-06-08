/**
 * @deprecated 이 라우트는 /api/generate 로 이전되었습니다.
 * app.ts에서 generateRouter 를 사용하세요.
 * 하위 호환을 위해 파일은 유지합니다.
 */
import { Router } from 'express'
const router = Router()
router.all('*', (_req, res) => {
  res.status(410).json({ success: false, error: '이 엔드포인트는 /api/generate 로 이전되었습니다.' })
})
export default router
