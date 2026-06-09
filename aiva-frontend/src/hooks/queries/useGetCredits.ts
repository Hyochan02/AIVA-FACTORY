import { useQuery } from '@tanstack/react-query'
import { getCredits } from '../../api/credits/getCredits'
import type { CreditBalance } from '../../types/credit'

export const useGetCredits = () => {
  return useQuery<CreditBalance>({
    queryKey: ['credits'],
    queryFn: async () => (await getCredits()).data,
  })
}
