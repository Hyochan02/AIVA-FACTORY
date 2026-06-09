import { useQuery } from '@tanstack/react-query'
import { getPlans } from '../../api/subscriptions/getPlans'
import type { Plan } from '../../types/subscription'

export const useGetPlans = () => {
  return useQuery<Plan[]>({
    queryKey: ['plans'],
    queryFn: async () => (await getPlans()).data,
    staleTime: 1000 * 60 * 10,
  })
}
