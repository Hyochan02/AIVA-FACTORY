import { useMutation, useQueryClient } from '@tanstack/react-query'
import { saveMixSettings } from '../../api/editor/saveMixSettings'
import type { StemConfig } from '../../types/editor'

export const useSaveMixSettings = () => {
  const queryClient = useQueryClient()
  return useMutation<unknown, Error, { trackId: string; stemConfig: StemConfig }>({
    mutationFn: async ({ trackId, stemConfig }) => (await saveMixSettings(trackId, stemConfig)).data,
    onSuccess: (_data, { trackId, stemConfig }) => {
      queryClient.setQueryData(['mixSettings', trackId], stemConfig)
    },
  })
}
