export type TrackStatus = 'pending' | 'generating' | 'done' | 'error'

export interface Track {
  id: string
  title: string
  prompt: string
  genre: string
  mood: string
  bpm?: number
  duration: number
  status: TrackStatus
  audioUrl?: string
  coverUrl?: string
  createdAt: string
  isPublic: boolean
  likes: number
  plays: number
  // v3: 버전별 카드 분리 — 같은 생성 요청(suno_task_id)에서 나온 버전 번호
  version_num?: number
  suno_task_id?: string
}

// v3: 악기별 믹싱 - split_stem으로 분리되어 track_stems에 저장된 스템 1개
export interface Stem {
  stem_type: string
  audio_url: string
  created_at: string
}

export interface TrackListParams {
  q?: string
  genre?: string
  page?: number
  limit?: number
  sort?: string
  order?: 'asc' | 'desc'
}
