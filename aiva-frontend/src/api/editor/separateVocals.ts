import apiClient from '../client'
import type { SeparatePayload } from '../../types/editor'

export const separateVocals = (payload: SeparatePayload) =>
  apiClient.post('/editor/separate', payload)
