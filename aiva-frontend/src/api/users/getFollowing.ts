import apiClient from '../client'

export const getFollowing = (id: string, page = 1) =>
  apiClient.get(`/users/${id}/following?page=${page}`)
