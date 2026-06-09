import apiClient from '../client'

export const cancelGenerate = (trackId: string) =>
  apiClient.delete(`/generate/${trackId}`)
