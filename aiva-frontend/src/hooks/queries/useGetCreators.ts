import { useQuery } from '@tanstack/react-query'
import { getCreators } from '../../api/explore/getCreators'

export const useGetCreators = (limit = 6) => {
  return useQuery({
    queryKey: ['creators', limit],
    queryFn: async () => (await getCreators(limit)).data,
  })
}
