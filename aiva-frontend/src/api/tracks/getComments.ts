import apiClient from '../client'

export const getComments = (id: string, page = 1) =>
  apiClient.get(`/tracks/${id}/comments?page=${page}`)
