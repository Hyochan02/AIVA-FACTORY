import apiClient from '../client'

export const getCreators = (limit = 8) =>
  apiClient.get(`/explore/creators?limit=${limit}`)
