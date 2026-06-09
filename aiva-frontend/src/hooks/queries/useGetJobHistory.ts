import { useQuery } from '@tanstack/react-query'
import { getJobHistory } from '../../api/editor/getJobHistory'
import type { JobHistory } from '../../types/editor'

export const useGetJobHistory = (type?: JobHistory['type']) => {
  return useQuery<{ jobs: JobHistory[] }>({
    queryKey: ['jobHistory', type],
    queryFn: async () => (await getJobHistory(type)).data,
  })
}
