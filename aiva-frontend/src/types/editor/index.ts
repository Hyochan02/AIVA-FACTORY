export type SeparateType = 'separate_vocal' | 'split_stem'

export interface SeparatePayload {
  trackId: string
  type?: SeparateType
}

// stem_type(vocals/drums/bass/...) → audio_url
export type StemMap = Record<string, string>

export interface SeparateResult {
  status: string
  stems?: StemMap
}

export interface WavPayload {
  trackId: string
}

export interface VideoPayload {
  trackId: string
}

export interface JobHistory {
  id: string
  type: 'separate' | 'wav' | 'video'
  status: 'pending' | 'done' | 'error'
  result_url?: string
  extra?: string
  created_at: string
  track_title?: string
}

// Stem 편집기(StemMixer) — 스템별 볼륨/뮤트/솔로 저장 설정
// (editor_settings.stem_config JSON에 { [stemType]: StemMixSettings } 형태로 저장)
export interface StemMixSettings {
  volume: number
  muted: boolean
  solo: boolean
}

export type StemConfig = Record<string, StemMixSettings>
