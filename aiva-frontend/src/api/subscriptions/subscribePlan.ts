import apiClient from '../client'

export const subscribePlan = (payload: { planId: string; billing?: 'monthly' | 'yearly' }) =>
  apiClient.post('/subscriptions', payload)
