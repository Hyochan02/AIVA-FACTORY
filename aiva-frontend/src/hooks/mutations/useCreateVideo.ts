import { useMutation } from '@tanstack/react-query'
import { createVideo } from '../../api/editor/createVideo'
import type { VideoPayload } from '../../types/editor'

export const useCreateVideo = () => {
  return useMutation<unknown, Error, VideoPayload>({
    mutationFn: async (payload) => (await createVideo(payload)).data,
  })
}
