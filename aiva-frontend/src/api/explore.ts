/**
 * AIVA FACTORY · 탐색(Explore) API 모듈
 * Backend: /api/explore
 */
import apiClient from './client'

export interface ExploreListParams {
  genre?: string
  page?:  number
  limit?: number
}

/** 트렌딩 트랙 목록 */
export const getTrending = (params?: ExploreListParams) => {
  const qs = params
    ? '?' + new URLSearchParams(
        Object.fromEntries(
          Object.entries(params)
            .filter(([, v]) => v !== undefined && v !== '')
            .map(([k, v]) => [k, String(v)])
        )
      ).toString()
    : ''
  return apiClient.get(`/explore/trending${qs}`)
}

/** 최신 공개 트랙 목록 */
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

/** 인기 크리에이터 목록 */
export const getCreators = (limit = 8) =>
  apiClient.get(`/explore/creators?limit=${limit}`)

/** 통합 검색 (트랙 + 아티스트 + 장르) */
export const searchExplore = (q: string, params?: ExploreListParams) => {
  const p: Record<string, string> = { q }
  if (params?.genre) p.genre = params.genre
  if (params?.page)  p.page  = String(params.page)
  if (params?.limit) p.limit = String(params.limit)
  return apiClient.get(`/explore/search?` + new URLSearchParams(p).toString())
}
