import apiClient from '../client'
import type { ExtendPayload } from '../../types/editor'

export const extendTrack = (payload: ExtendPayload) =>
  apiClient.post('/editor/extend', payload)
