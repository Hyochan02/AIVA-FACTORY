import apiClient from '../client'

export const postForgotPassword = (email: string) =>
  apiClient.post('/auth/forgot-password', { email })
