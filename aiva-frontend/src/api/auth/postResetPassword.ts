import apiClient from '../client'

export const postResetPassword = (payload: { token: string; newPassword: string }) =>
  apiClient.post('/auth/reset-password', payload)
