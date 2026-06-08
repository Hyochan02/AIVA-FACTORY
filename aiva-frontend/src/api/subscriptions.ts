import apiClient from './client'

export interface Plan {
  id: string
  name: string
  price: { monthly: number; yearly: number }
  credits: number
  features: string[]
  limits: { wav: boolean; stems: boolean; commercial: boolean }
}

export interface CurrentSubscription {
  plan: string
  status: string
  currentPeriodEnd: string | null
  cancelAtPeriodEnd: boolean
}

/** 요금제 목록 조회 (인증 불필요) */
export const getPlans = () =>
  apiClient.get('/subscriptions/plans')

/** 현재 구독 정보 조회 */
export const getCurrentSubscription = () =>
  apiClient.get('/subscriptions/current')

/** 구독 신청 */
export const subscribePlan = (payload: { planId: string; billing?: 'monthly' | 'yearly' }) =>
  apiClient.post('/subscriptions', payload)

/** 구독 취소 */
export const cancelSubscription = () =>
  apiClient.delete('/subscriptions/current')
