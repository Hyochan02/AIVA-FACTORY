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
