import apiClient from '../client'

export const patchTrack = (id: string, body: { title?: string; isPublic?: boolean }) =>
  apiClient.patch(`/tracks/${id}`, body)
