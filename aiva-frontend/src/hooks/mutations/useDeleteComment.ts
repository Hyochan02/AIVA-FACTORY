import { useMutation, useQueryClient } from '@tanstack/react-query'
import { deleteComment } from '../../api/tracks/deleteComment'

interface DeleteCommentVariables {
  trackId: string
  commentId: string
}

export const useDeleteComment = () => {
  const queryClient = useQueryClient()

  return useMutation<void, Error, DeleteCommentVariables>({
    mutationFn: async ({ trackId, commentId }) => { await deleteComment(trackId, commentId) },
    onSuccess: (_, { trackId }) => {
      queryClient.invalidateQueries({ queryKey: ['comments', trackId] })
    },
  })
}
