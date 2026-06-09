import apiClient from '../client'

export const pollLyrics = (jobId: string) =>
  apiClient.get(`/editor/lyrics/${jobId}`)
