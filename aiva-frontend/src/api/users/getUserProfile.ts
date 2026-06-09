import apiClient from '../client'

export const getUserProfile = (id: string) => apiClient.get(`/users/${id}`)
