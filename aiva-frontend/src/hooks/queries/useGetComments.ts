import { useQuery } from '@tanstack/react-query'
import { getComments } from '../../api/tracks/getComments'

export const useGetComments = (trackId: string) => {
  return useQuery({
    queryKey: ['comments', trackId],
    queryFn: async () => (await getComments(trackId)).data,
    enabled: !!trackId,
  })
}
