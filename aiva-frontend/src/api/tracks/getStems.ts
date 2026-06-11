import apiClient from '../client'

// GET /api/tracks/:id/stems → { success, data: { stems: [{ stem_type, audio_url, created_at }] } }
export const getStems = (trackId: string) => apiClient.get(`/tracks/${trackId}/stems`)
