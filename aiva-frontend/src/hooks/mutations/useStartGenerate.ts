import { useMutation } from '@tanstack/react-query'
import { startGenerate } from '../../api/generate/startGenerate'
import type { GeneratePayload, GenerateResponse } from '../../types/generate'

export const useStartGenerate = () => {
  return useMutation<GenerateResponse, Error, GeneratePayload>({
    mutationFn: async (payload) => (await startGenerate(payload)).data,
  })
}
