import apiClient from '../client'

export const getCurrentSubscription = () => apiClient.get('/subscriptions/current')
