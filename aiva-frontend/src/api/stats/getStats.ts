import apiClient from '../client'

export const getStats = () => apiClient.get('/stats')
