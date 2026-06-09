import apiClient from '../client'

export const getFollowers = (id: string, page = 1) =>
  apiClient.get(`/users/${id}/followers?page=${page}`)
