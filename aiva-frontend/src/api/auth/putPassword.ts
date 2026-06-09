import apiClient from '../client'

export const putPassword = (payload: { currentPassword: string; newPassword: string }) =>
  apiClient.put('/auth/password', payload)
