import apiClient from '../client'

export const pollVideo = (jobId: string) =>
  apiClient.get(`/editor/video/${jobId}`)
