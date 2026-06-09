import apiClient from '../client'
import type { TrackListParams } from '../../types/track'

export const getTracks = (params?: TrackListParams) => {
  const qs = params
    ? '?' + new URLSearchParams(
        Object.fromEntries(
          Object.entries(params)
            .filter(([, v]) => v !== undefined && v !== '')
            .map(([k, v]) => [k, String(v)])
        )
      ).toString()
    : ''
  return apiClient.get(`/tracks${qs}`)
}
