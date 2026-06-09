export interface ExtendPayload {
  trackId: string
  prompt?: string
  style?: string
  continueAt?: number
}

export interface LyricsPayload {
  prompt: string
}

export interface LyricsResult {
  status: string
  title?: string
  text?: string
  variants?: Array<{ title: string; text: string }>
}

export type SeparateType = 'separate_vocal' | 'split_stem'

export interface SeparatePayload {
  trackId: string
  type?: SeparateType
}

export interface SeparateResult {
  status: string
  vocalUrl?: string
  instrumentalUrl?: string
  drumsUrl?: string
  bassUrl?: string
  guitarUrl?: string
}

export interface WavPayload {
  trackId: string
  versionNum?: number
}

export interface VideoPayload {
  trackId: string
}

export interface JobHistory {
  id: string
  type: 'extend' | 'lyrics' | 'separate' | 'wav' | 'video'
  status: 'pending' | 'done' | 'error'
  result_url?: string
  extra?: string
  created_at: string
  track_title?: string
}
