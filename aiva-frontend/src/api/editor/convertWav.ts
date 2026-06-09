import apiClient from '../client'
import type { WavPayload } from '../../types/editor'

export const convertWav = (payload: WavPayload) =>
  apiClient.post('/editor/wav', payload)
