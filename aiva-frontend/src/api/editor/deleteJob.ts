import apiClient from '../client'

export const deleteJob = (jobId: string) =>
  apiClient.delete(`/editor/jobs/${jobId}`)
