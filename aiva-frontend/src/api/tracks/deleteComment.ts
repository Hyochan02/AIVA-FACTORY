import apiClient from '../client'

export const deleteComment = (trackId: string, commentId: string) =>
  apiClient.delete(`/tracks/${trackId}/comments/${commentId}`)
