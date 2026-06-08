import type { ReactNode } from 'react'

export interface User {
  id: string
  email: string
  name: string
  avatar?: string
  plan: 'free' | 'pro' | 'enterprise'
  credits: number
  createdAt: string
}

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

export interface GenerationRequest {
  prompt: string
  genre: string
  mood: string
  bpm?: number
  duration?: number
  instrumental?: boolean
}

export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface Pagination {
  page: number
  limit: number
  total: number
  totalPages: number
}

export interface PaginatedResponse<T> {
  items: T[]
  pagination: Pagination
}

export type PlanType = 'free' | 'pro' | 'enterprise'

export interface Plan {
  id: PlanType
  name: string
  price: number
  credits: number
  features: string[]
}

export interface NavItem {
  key: string
  label: string
  path: string
  icon: ReactNode
  badge?: string
}
