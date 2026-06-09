import { useMutation } from '@tanstack/react-query'
import { postLike } from '../../api/tracks/postLike'

export const usePostLike = () => {
  return useMutation<void, Error, string>({
    mutationFn: async (trackId) => { await postLike(trackId) },
  })
}
