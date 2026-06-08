/**
 * AIVA FACTORY · Express 서버 엔트리포인트
 *
 * Best Practice: 서버 설정 (미들웨어, 라우트)을 app.ts에 분리하고
 * index.ts에서는 포트 리스닝만 담당합니다.
 * → 테스트 시 app만 import해서 supertest로 사용 가능
 */
import 'dotenv/config'
import app from './app'

const PORT = Number(process.env.PORT) || 3000

app.listen(PORT, () => {
  console.log(`
  ╔══════════════════════════════════════╗
  ║     AIVA FACTORY API Server          ║
  ║     http://localhost:${PORT}           ║
  ║     ENV: ${process.env.NODE_ENV}      ║
  ╚══════════════════════════════════════╝
  `)
})
