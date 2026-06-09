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
}

export interface TrackListParams {
  q?: string
  genre?: string
  page?: number
  limit?: number
  sort?: string
  order?: 'asc' | 'desc'
}
