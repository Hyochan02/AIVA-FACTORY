import apiClient from './client'

export interface CreditBalance {
  balance: number
  plan: string
  monthlyGrant: number
}

export interface CreditHistoryItem {
  id: string
  type: 'grant' | 'usage' | 'purchase' | 'refund'
  amount: number
  balance: number
  description: string
  created_at: string
}

export interface CreditHistoryResponse {
  items: CreditHistoryItem[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

/** 크레딧 잔액 + 플랜 조회 */
export const getCredits = () =>
  apiClient.get('/credits')

/** 크레딧 이용 내역 (페이지네이션 지원) */
export const getCreditHistory = (params?: { page?: number; limit?: number; type?: string }) => {
  const qs = params
    ? '?' + Object.entries(params).filter(([, v]) => v !== undefined).map(([k, v]) => `${k}=${v}`).join('&')
    : ''
  return apiClient.get(`/credits/history${qs}`)
}
