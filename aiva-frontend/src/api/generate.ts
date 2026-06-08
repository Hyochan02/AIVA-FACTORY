/**
 * AIVA FACTORY · 음악 생성 API 모듈
 * Backend: /api/generate
 */
import apiClient from './client'

export interface GeneratePayload {
  prompt:       string
  genre?:       string
  mood?:        string
  instruments?: string[]
  bpm?:         number
  duration?:    number
  instrumental?: boolean
  title?:       string
}

export interface GenerateResponse {
  taskId:           string
  trackId:          string
  estimatedSeconds: number
  creditsUsed:      number
  creditsRemaining: number
}

export interface StatusResponse {
  trackId:  string
  status:   'pending' | 'generating' | 'done' | 'error'
  progress: number
  step:     string
  audioUrl: string | null
  versions: TrackVersion[]
}

export interface TrackVersion {
  id:             string
  track_id:       string
  version_num:    number
  suno_audio_id?: string
  audio_url:      string
  stream_url?:    string
  image_url?:     string
  title?:         string
  duration?:      number
}

/** 음악 생성 요청 */
export const startGenerate = (payload: GeneratePayload) =>
  apiClient.post<GenerateResponse>('/generate', payload)

/** 생성 상태 폴링 (3초 간격 권장) */
export const pollGenerateStatus = (trackId: string) =>
  apiClient.get<StatusResponse>(`/generate/${trackId}/status`)

/** 생성 취소 */
export const cancelGenerate = (trackId: string) =>
  apiClient.delete(`/generate/${trackId}`)
