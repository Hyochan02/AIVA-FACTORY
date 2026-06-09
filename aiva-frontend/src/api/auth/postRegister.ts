import apiClient from '../client'
import type { RegisterPayload } from '../../types/auth'

export const postRegister = async (payload: RegisterPayload) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const res = (await apiClient.post('/auth/register', payload)) as any
  if (res.data?.token) localStorage.setItem('aiva_token', res.data.token)
  return res
}
