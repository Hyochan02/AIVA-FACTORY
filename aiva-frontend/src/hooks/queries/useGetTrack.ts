import { useQuery } from '@tanstack/react-query'
import { getTrack } from '../../api/tracks/getTrack'
import type { Track } from '../../types/track'

export const useGetTrack = (id: string) => {
  return useQuery<Track>({
    queryKey: ['track', id],
    queryFn: async () => (await getTrack(id)).data,
    enabled: !!id,
  })
}
