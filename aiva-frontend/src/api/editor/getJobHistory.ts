import apiClient from '../client'
import type { JobHistory } from '../../types/editor'

export const getJobHistory = (type?: JobHistory['type'], limit?: number) => {
  const params = new URLSearchParams()
  if (type)  params.set('type',  type)
  if (limit) params.set('limit', String(limit))
  const qs = params.toString()
  return apiClient.get(`/editor/jobs${qs ? `?${qs}` : ''}`)
}
