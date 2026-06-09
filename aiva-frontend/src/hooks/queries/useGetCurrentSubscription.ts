import { useQuery } from '@tanstack/react-query'
import { getCurrentSubscription } from '../../api/subscriptions/getCurrentSubscription'
import type { CurrentSubscription } from '../../types/subscription'

export const useGetCurrentSubscription = (enabled = true) => {
  return useQuery<CurrentSubscription>({
    queryKey: ['currentSubscription'],
    queryFn: async () => (await getCurrentSubscription()).data,
    enabled,
  })
}
