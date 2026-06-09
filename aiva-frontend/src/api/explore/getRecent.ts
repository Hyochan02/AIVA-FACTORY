import apiClient from '../client'
import type { ExploreListParams } from '../../types/explore'

export const getRecent = (params?: ExploreListParams) => {
  const qs = params
    ? '?' + new URLSearchParams(
        Object.fromEntries(
          Object.entries(params)
            .filter(([, v]) => v !== undefined && v !== '')
            .map(([k, v]) => [k, String(v)])
        )
      ).toString()
    : ''
  return apiClient.get(`/explore/recent${qs}`)
}
