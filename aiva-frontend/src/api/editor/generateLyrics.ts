import apiClient from '../client'
import type { LyricsPayload } from '../../types/editor'

export const generateLyrics = (payload: LyricsPayload) =>
  apiClient.post('/editor/lyrics', payload)
