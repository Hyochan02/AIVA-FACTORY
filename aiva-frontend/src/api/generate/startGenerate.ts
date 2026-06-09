import apiClient from '../client'
import type { GeneratePayload } from '../../types/generate'

export const startGenerate = (payload: GeneratePayload) =>
  apiClient.post('/generate', payload)
