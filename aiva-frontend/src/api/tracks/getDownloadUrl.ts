import apiClient from '../client'

export const getDownloadUrl = (id: string, format: 'mp3' | 'wav' | 'stems' = 'mp3') =>
  apiClient.get(`/tracks/${id}/download?format=${format}`)
