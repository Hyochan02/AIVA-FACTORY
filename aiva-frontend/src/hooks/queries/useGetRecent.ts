import { useQuery } from '@tanstack/react-query'
import { getRecent } from '../../api/explore/getRecent'
import type { ExploreListParams } from '../../types/explore'
import type { PaginatedResponse } from '../../types/api'
import type { Track } from '../../types/track'

export const useGetRecent = (params?: ExploreListParams, enabled = true) => {
  return useQuery<PaginatedResponse<Track>>({
    queryKey: ['recent', params],
    queryFn: async () => (await getRecent(params)).data,
    enabled,
    placeholderData: (prev) => prev,
  })
}
