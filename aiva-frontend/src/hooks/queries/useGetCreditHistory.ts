import { useQuery } from '@tanstack/react-query'
import { getCreditHistory } from '../../api/credits/getCreditHistory'
import type { CreditHistoryResponse } from '../../types/credit'

export const useGetCreditHistory = (page = 1, limit = 20) => {
  return useQuery<CreditHistoryResponse>({
    queryKey: ['creditHistory', page, limit],
    queryFn: async () => (await getCreditHistory({ page, limit })).data,
    placeholderData: (prev) => prev,
  })
}
