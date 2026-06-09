import { useMutation } from '@tanstack/react-query'
import { cancelGenerate } from '../../api/generate/cancelGenerate'

export const useCancelGenerate = () => {
  return useMutation<void, Error, string>({
    mutationFn: async (trackId) => { await cancelGenerate(trackId) },
  })
}
