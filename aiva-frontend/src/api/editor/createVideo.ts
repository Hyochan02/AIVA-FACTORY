import apiClient from '../client'
import type { VideoPayload } from '../../types/editor'

export const createVideo = (payload: VideoPayload) =>
  apiClient.post('/editor/video', payload)
