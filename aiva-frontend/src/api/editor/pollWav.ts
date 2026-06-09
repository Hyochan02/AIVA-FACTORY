import apiClient from '../client'

export const pollWav = (jobId: string) =>
  apiClient.get(`/editor/wav/${jobId}`)
