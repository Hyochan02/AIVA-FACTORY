import apiClient from '../client'
import type { StemConfig } from '../../types/editor'

// PUT /api/editor/mix/:trackId → { success, data: { stemConfig: StemConfig } }
export const saveMixSettings = (trackId: string, stemConfig: StemConfig) =>
  apiClient.put(`/editor/mix/${trackId}`, { stemConfig })
