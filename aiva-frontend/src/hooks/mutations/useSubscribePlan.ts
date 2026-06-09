import { useMutation, useQueryClient } from '@tanstack/react-query'
import { subscribePlan } from '../../api/subscriptions/subscribePlan'

interface SubscribePlanVariables {
  planId: string
  billing: 'monthly' | 'yearly'
}

export const useSubscribePlan = () => {
  const queryClient = useQueryClient()

  return useMutation<void, Error, SubscribePlanVariables>({
    mutationFn: async (variables) => { await subscribePlan(variables) },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentSubscription'] })
    },
  })
}
