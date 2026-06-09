import { useMutation } from '@tanstack/react-query'
import { postFollow } from '../../api/users/postFollow'

export const usePostFollow = () => {
  return useMutation<void, Error, string>({
    mutationFn: async (userId) => { await postFollow(userId) },
  })
}
