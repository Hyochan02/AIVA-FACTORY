import apiClient from '../client'

export const getCreditHistory = (params?: { page?: number; limit?: number; type?: string }) => {
  const qs = params
    ? '?' + Object.entries(params).filter(([, v]) => v !== undefined).map(([k, v]) => `${k}=${v}`).join('&')
    : ''
  return apiClient.get(`/credits/history${qs}`)
}
