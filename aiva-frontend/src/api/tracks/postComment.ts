import apiClient from '../client'

export const postComment = (id: string, content: string) =>
  apiClient.post(`/tracks/${id}/comments`, { content })
