import { useMutation } from '@tanstack/react-query'
import { convertWav } from '../../api/editor/convertWav'
import type { WavPayload } from '../../types/editor'

export const useConvertWav = () => {
  return useMutation<unknown, Error, WavPayload>({
    mutationFn: async (payload) => (await convertWav(payload)).data,
  })
}
