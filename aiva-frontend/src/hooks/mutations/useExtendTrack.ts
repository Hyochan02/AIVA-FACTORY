import { useMutation } from '@tanstack/react-query'
import { extendTrack } from '../../api/editor/extendTrack'
import type { ExtendPayload } from '../../types/editor'

export const useExtendTrack = () => {
  return useMutation<unknown, Error, ExtendPayload>({
    mutationFn: async (payload) => (await extendTrack(payload)).data,
  })
}
