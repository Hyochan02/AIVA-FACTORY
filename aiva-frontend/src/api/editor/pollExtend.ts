import apiClient from '../client'

export const pollExtend = (jobId: string) =>
  apiClient.get(`/editor/extend/${jobId}`)
