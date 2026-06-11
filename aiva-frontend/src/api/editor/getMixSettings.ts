import apiClient from '../client'

// GET /api/editor/mix/:trackId → { success, data: { stemConfig: StemConfig | null } }
export const getMixSettings = (trackId: string) => apiClient.get(`/editor/mix/${trackId}`)
