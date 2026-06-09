import { useMutation } from '@tanstack/react-query'
import { deleteLike } from '../../api/tracks/deleteLike'

export const useDeleteLike = () => {
  return useMutation<void, Error, string>({
    mutationFn: async (trackId) => { await deleteLike(trackId) },
  })
}
