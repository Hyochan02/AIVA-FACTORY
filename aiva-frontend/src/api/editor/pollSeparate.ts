import apiClient from '../client'

export const pollSeparate = (jobId: string) =>
  apiClient.get(`/editor/separate/${jobId}`)
