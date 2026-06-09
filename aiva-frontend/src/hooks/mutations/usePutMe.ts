import { useMutation } from '@tanstack/react-query'
import { putMe } from '../../api/auth/putMe'

export const usePutMe = () => {
  return useMutation<unknown, Error, { name?: string; avatarUrl?: string }>({
    mutationFn: async (data) => (await putMe(data)).data,
  })
}
