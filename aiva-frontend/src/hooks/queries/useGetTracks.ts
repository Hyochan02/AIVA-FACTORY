import { useQuery } from '@tanstack/react-query'
import { getTracks } from '../../api/tracks/getTracks'
import type { TrackListParams } from '../../types/track'
import type { PaginatedResponse } from '../../types/api'
import type { Track } from '../../types/track'

export const useGetTracks = (params?: TrackListParams) => {
  return useQuery<PaginatedResponse<Track>>({
    queryKey: ['tracks', params],
    queryFn: async () => (await getTracks(params)).data,
    placeholderData: (prev) => prev,
  })
}
