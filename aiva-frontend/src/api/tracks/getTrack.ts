import apiClient from '../client'

export const getTrack = (id: string) => apiClient.get(`/tracks/${id}`)
