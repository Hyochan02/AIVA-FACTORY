import apiClient from './client'

export interface LoginPayload    { email: string; password: string }
export interface RegisterPayload { name: string; email: string; password: string; useCases?: string[] }

export const login = async (payload: LoginPayload) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const res = await apiClient.post('/auth/login', payload) as any
  if (res.data?.token) localStorage.setItem('aiva_token', res.data.token)
  return res
}

export const register = async (payload: RegisterPayload) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const res = await apiClient.post('/auth/register', payload) as any
  if (res.data?.token) localStorage.setItem('aiva_token', res.data.token)
  return res
}

export const logout = () => {
  localStorage.removeItem('aiva_token')
  window.location.href = '/login'
}

export const getMe = () => apiClient.get('/auth/me')
