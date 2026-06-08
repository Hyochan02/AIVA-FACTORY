/**
 * AIVA FACTORY · 대시보드 통계 API 모듈
 * Backend: /api/stats
 */
import apiClient from './client'

/** 대시보드 통계 (인증 필요) */
export const getStats = () => apiClient.get('/stats')

/**
 * 실제 백엔드 응답 구조 (aiva-backend/src/routes/stats.ts 기준):
 * {
 *   success: true,
 *   data: {
 *     totalTracks:      24,   // 총 생성 트랙 수
 *     creditsRemaining: 76,   // 남은 크레딧
 *     totalPlays:       1248, // 총 재생 수
 *     libraryCount:     18,   // done 상태 트랙 수
 *     weeklyChange: {
 *       tracks: 3,            // 이번 주 생성 트랙 수
 *       plays:  140,          // 이번 주 재생 수
 *     }
 *   }
 * }
 */
export interface DashboardStats {
  totalTracks:      number
  creditsRemaining: number
  totalPlays:       number
  libraryCount:     number
  weeklyChange: {
    tracks: number
    plays:  number
  }
}
