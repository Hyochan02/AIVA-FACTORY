export interface GeneratePayload {
  prompt: string
  genre?: string
  mood?: string
  instruments?: string[]
  bpm?: number
  duration?: number
  instrumental?: boolean
  title?: string
  isPublic?: boolean
}

export interface GenerateResponse {
  taskId: string
  trackId: string
  estimatedSeconds: number
  creditsUsed: number
  creditsRemaining: number
}

export interface TrackVersion {
  id: string
  track_id: string
  version_num: number
  suno_audio_id?: string
  audio_url: string
  stream_url?: string
  image_url?: string
  title?: string
  duration?: number
}

export interface StatusResponse {
  trackId: string
  status: 'pending' | 'generating' | 'done' | 'error'
  progress: number
  step: string
  audioUrl: string | null
  versions: TrackVersion[]
}
