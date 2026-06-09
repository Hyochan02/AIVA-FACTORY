import apiClient from '../client'

export const getCredits = () => apiClient.get('/credits')
