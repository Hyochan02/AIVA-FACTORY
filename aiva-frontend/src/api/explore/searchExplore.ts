import apiClient from '../client'
import type { ExploreListParams } from '../../types/explore'

export const searchExplore = (q: string, params?: ExploreListParams) => {
  const p: Record<string, string> = { q }
  if (params?.genre) p.genre = params.genre
  if (params?.page)  p.page  = String(params.page)
  if (params?.limit) p.limit = String(params.limit)
  return apiClient.get('/explore/search?' + new URLSearchParams(p).toString())
}
