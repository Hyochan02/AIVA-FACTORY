import { useQuery } from '@tanstack/react-query'
import { getStats } from '../../api/stats/getStats'
import type { DashboardStats } from '../../types/stats'

export const useGetStats = () => {
  return useQuery<DashboardStats>({
    queryKey: ['stats'],
    queryFn: async () => (await getStats()).data,
  })
}
