import { useQuery } from '@tanstack/react-query'
import { pollStatus } from '../../api/generate/pollStatus'
import type { StatusResponse } from '../../types/generate'

export const usePollStatus = (trackId: string, enabled = true) => {
  return useQuery<StatusResponse>({
    queryKey: ['generateStatus', trackId],
    queryFn: async () => (await pollStatus(trackId)).data,
    enabled: !!trackId && enabled,
    refetchInterval: (query) => {
      const status = query.state.data?.status
      if (status === 'done' || status === 'error') return false
      return 3000
    },
  })
}
