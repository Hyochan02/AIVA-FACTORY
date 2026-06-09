import apiClient from '../client'

export const postLike = (id: string) => apiClient.post(`/tracks/${id}/like`)
