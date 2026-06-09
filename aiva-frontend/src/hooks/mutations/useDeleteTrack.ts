import { useMutation, useQueryClient } from '@tanstack/react-query'
import { deleteTrack } from '../../api/tracks/deleteTrack'

export const useDeleteTrack = () => {
  const queryClient = useQueryClient()

  return useMutation<void, Error, string>({
    mutationFn: async (id) => { await deleteTrack(id) },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tracks'] })
    },
  })
}
