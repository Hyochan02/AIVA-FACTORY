import { useQuery } from '@tanstack/react-query'
import { searchExplore } from '../../api/explore/searchExplore'
import type { ExploreListParams } from '../../types/explore'
import type { Track } from '../../types/track'

interface SearchResult {
  tracks: Track[]
  users: Array<{ id: string; name: string; avatar_url?: string }>
}

export const useSearchExplore = (keyword: string, params?: ExploreListParams) => {
  return useQuery<SearchResult>({
    queryKey: ['searchExplore', keyword, params],
    queryFn: async () => (await searchExplore(keyword, params)).data,
    enabled: !!keyword.trim(),
    placeholderData: (prev) => prev,
  })
}
