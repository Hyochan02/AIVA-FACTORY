import apiClient from '../client'
import type { LoginPayload } from '../../types/auth'

export const postLogin = async (payload: LoginPayload) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const res = (await apiClient.post('/auth/login', payload)) as any
  if (res.data?.token) localStorage.setItem('aiva_token', res.data.token)
  return res
}
