import apiClient from '../client'

export const deleteFollow = (id: string) => apiClient.delete(`/users/${id}/follow`)
