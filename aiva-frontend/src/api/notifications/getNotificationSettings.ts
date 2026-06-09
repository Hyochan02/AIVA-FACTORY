import apiClient from '../client'

export const getNotificationSettings = () => apiClient.get('/notifications/settings')
