import apiClient from '../client'

export const deleteLike = (id: string) => apiClient.delete(`/tracks/${id}/like`)
