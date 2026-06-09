import { useMutation } from '@tanstack/react-query'
import { generateLyrics } from '../../api/editor/generateLyrics'
import type { LyricsPayload, LyricsResult } from '../../types/editor'

export const useGenerateLyrics = () => {
  return useMutation<LyricsResult, Error, LyricsPayload>({
    mutationFn: async (payload) => (await generateLyrics(payload)).data,
  })
}
