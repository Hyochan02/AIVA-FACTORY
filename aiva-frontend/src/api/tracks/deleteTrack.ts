import apiClient from '../client'

export const deleteTrack = (id: string) => apiClient.delete(`/tracks/${id}`)
