/**
 * MySQL 데이터베이스 연결 설정
 *
 * Best Practice: mysql2/promise 사용 (async/await 지원)
 * createPool: 커넥션을 재사용해 매번 연결/해제 오버헤드를 줄임
 */
import mysql from 'mysql2/promise'

export const pool = mysql.createPool({
  host:     process.env.DB_HOST || 'localhost',
  port:     Number(process.env.DB_PORT) || 3306,
  user:     process.env.DB_USER || 'aiva_user',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'aiva_factory',
  waitForConnections: true,
  connectionLimit: 10,    // 최대 동시 연결 수
  queueLimit: 0,
})

// 연결 테스트 함수 (서버 시작 시 호출)
export const testDBConnection = async () => {
  try {
    const conn = await pool.getConnection()
    console.log('✅ MySQL 연결 성공')
    conn.release()
  } catch (err) {
    console.error('❌ MySQL 연결 실패:', err)
    process.exit(1)
  }
}
