import { useMutation, useQueryClient } from '@tanstack/react-query'
import { cancelSubscription } from '../../api/subscriptions/cancelSubscription'

export const useCancelSubscription = () => {
  const queryClient = useQueryClient()

  return useMutation<void, Error, void>({
    mutationFn: async () => { await cancelSubscription() },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentSubscription'] })
    },
  })
}
