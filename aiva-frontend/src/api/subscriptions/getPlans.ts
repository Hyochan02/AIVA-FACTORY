import apiClient from '../client'

export const getPlans = () => apiClient.get('/subscriptions/plans')
