import apiClient from '../client'

export const cancelSubscription = () => apiClient.delete('/subscriptions/current')
