import { useQuery } from '@tanstack/react-query'
import { getTrending } from '../../api/explore/getTrending'
import type { ExploreListParams } from '../../types/explore'
import type { PaginatedResponse } from '../../types/api'
import type { Track } from '../../types/track'

export const useGetTrending = (params?: ExploreListParams, enabled = true) => {
  return useQuery<PaginatedResponse<Track>>({
    queryKey: ['trending', params],
    queryFn: async () => (await getTrending(params)).data,
    enabled,
    placeholderData: (prev) => prev,
  })
}
