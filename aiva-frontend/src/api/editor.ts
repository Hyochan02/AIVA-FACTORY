/**
 * AIVA FACTORY · 음악 편집 API 모듈
 * Backend: /api/editor
 * 모든 작업은 비동기: jobId 반환 → 폴링으로 결과 확인
 */
import apiClient from './client'

// ─ Extend ──────────────────────────────────────────────────
export interface ExtendPayload {
  trackId:    string
  prompt?:    string
  style?:     string
  continueAt?: number   // 연장 시작 위치 (초, 기본 60)
}
export const extendTrack = (payload: ExtendPayload) =>
  apiClient.post('/editor/extend', payload)

export const pollExtend = (jobId: string) =>
  apiClient.get(`/editor/extend/${jobId}`)

// ─ Lyrics ──────────────────────────────────────────────────
export interface LyricsPayload { prompt: string }
export interface LyricsResult  { status: string; title?: string; text?: string; variants?: Array<{ title: string; text: string }> }

export const generateLyrics = (payload: LyricsPayload) =>
  apiClient.post('/editor/lyrics', payload)

export const pollLyrics = (jobId: string) =>
  apiClient.get(`/editor/lyrics/${jobId}`)

// ─ Separate ────────────────────────────────────────────────
export type SeparateType = 'separate_vocal' | 'split_stem'

export interface SeparatePayload {
  trackId: string
  type?:   SeparateType
}
export interface SeparateResult {
  status:          string
  vocalUrl?:       string
  instrumentalUrl?: string
  drumsUrl?:       string
  bassUrl?:        string
  guitarUrl?:      string
}

export const separateVocals = (payload: SeparatePayload) =>
  apiClient.post('/editor/separate', payload)

export const pollSeparate = (jobId: string) =>
  apiClient.get(`/editor/separate/${jobId}`)

// ─ WAV ─────────────────────────────────────────────────────
export interface WavPayload {
  trackId:     string
  versionNum?: number
}
export const convertWav = (payload: WavPayload) =>
  apiClient.post('/editor/wav', payload)

export const pollWav = (jobId: string) =>
  apiClient.get(`/editor/wav/${jobId}`)

// ─ Video ───────────────────────────────────────────────────
export interface VideoPayload { trackId: string }
export const createVideo = (payload: VideoPayload) =>
  apiClient.post('/editor/video', payload)

export const pollVideo = (jobId: string) =>
  apiClient.get(`/editor/video/${jobId}`)
