import apiClient from '../client'

export const postFollow = (id: string) => apiClient.post(`/users/${id}/follow`)
