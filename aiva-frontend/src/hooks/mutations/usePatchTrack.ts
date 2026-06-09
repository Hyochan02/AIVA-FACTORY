import { useMutation, useQueryClient } from '@tanstack/react-query'
import { patchTrack } from '../../api/tracks/patchTrack'

interface PatchTrackVariables {
  id: string
  data: { title?: string; isPublic?: boolean }
}

export const usePatchTrack = () => {
  const queryClient = useQueryClient()

  return useMutation<void, Error, PatchTrackVariables>({
    mutationFn: async ({ id, data }) => { await patchTrack(id, data) },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['tracks'] })
      queryClient.invalidateQueries({ queryKey: ['track', id] })
    },
  })
}
