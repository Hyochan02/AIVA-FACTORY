import { useMutation } from '@tanstack/react-query'
import { separateVocals } from '../../api/editor/separateVocals'
import type { SeparatePayload } from '../../types/editor'

export const useSeparateVocals = () => {
  return useMutation<unknown, Error, SeparatePayload>({
    mutationFn: async (payload) => (await separateVocals(payload)).data,
  })
}
