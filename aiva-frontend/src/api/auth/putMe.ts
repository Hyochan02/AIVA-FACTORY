import apiClient from '../client'

export const putMe = (payload: { name?: string; avatar?: string }) =>
  apiClient.put('/auth/me', payload)
