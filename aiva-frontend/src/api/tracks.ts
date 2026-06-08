/**
 * AIVA FACTORY · 트랙 API 모듈
 * Backend: /api/tracks
 */
import apiClient from './client'

export interface TrackListParams {
  q?:      string
  genre?:  string
  page?:   number
  limit?:  number
  sort?:   string
  order?:  'asc' | 'desc'
}

/** 내 트랙 목록 조회 (인증 필요) */
export const getTracks = (params?: TrackListParams) => {
  const qs = params
    ? '?' + new URLSearchParams(
        Object.fromEntries(
          Object.entries(params)
            .filter(([, v]) => v !== undefined && v !== '')
            .map(([k, v]) => [k, String(v)])
        )
      ).toString()
    : ''
  return apiClient.get(`/tracks${qs}`)
}

/** 트랙 단건 조회 */
export const getTrack = (id: string) => apiClient.get(`/tracks/${id}`)

/** 트랙 정보 수정 (제목, 공개 여부) */
export const updateTrack = (id: string, body: { title?: string; isPublic?: boolean }) =>
  apiClient.patch(`/tracks/${id}`, body)

/** 트랙 삭제 */
export const deleteTrack = (id: string) => apiClient.delete(`/tracks/${id}`)

/** 다운로드 URL 요청 (S3 Pre-signed URL 반환) */
export const getDownloadUrl = (id: string, format: 'mp3' | 'wav' | 'stems' = 'mp3') =>
  apiClient.get(`/tracks/${id}/download?format=${format}`)

/** 좋아요 추가 */
export const likeTrack = (id: string) => apiClient.post(`/tracks/${id}/like`)

/** 좋아요 취소 */
export const unlikeTrack = (id: string) => apiClient.delete(`/tracks/${id}/like`)

/** 댓글 목록 */
export const getComments = (id: string, page = 1) =>
  apiClient.get(`/tracks/${id}/comments?page=${page}`)

/** 댓글 작성 */
export const postComment = (id: string, content: string) =>
  apiClient.post(`/tracks/${id}/comments`, { content })

/** 댓글 삭제 */
export const deleteComment = (trackId: string, commentId: string) =>
  apiClient.delete(`/tracks/${trackId}/comments/${commentId}`)
