import { useMutation } from '@tanstack/react-query'
import { deleteFollow } from '../../api/users/deleteFollow'

export const useDeleteFollow = () => {
  return useMutation<void, Error, string>({
    mutationFn: async (userId) => { await deleteFollow(userId) },
  })
}
