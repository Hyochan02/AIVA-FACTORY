import { useMutation, useQueryClient } from '@tanstack/react-query'
import { postComment } from '../../api/tracks/postComment'

interface PostCommentVariables {
  trackId: string
  content: string
}

export const usePostComment = () => {
  const queryClient = useQueryClient()

  return useMutation<void, Error, PostCommentVariables>({
    mutationFn: async ({ trackId, content }) => { await postComment(trackId, content) },
    onSuccess: (_, { trackId }) => {
      queryClient.invalidateQueries({ queryKey: ['comments', trackId] })
    },
  })
}
