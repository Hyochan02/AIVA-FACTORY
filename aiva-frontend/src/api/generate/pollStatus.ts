import apiClient from '../client'

export const pollStatus = (trackId: string) =>
  apiClient.get(`/generate/${trackId}/status`)
