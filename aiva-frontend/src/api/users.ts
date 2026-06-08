/**
 * AIVA FACTORY · 유저 API 모듈
 * Backend: /api/users
 */
import apiClient from './client'

/** 특정 유저 공개 프로필 조회 */
export const getUserProfile = (id: string) => apiClient.get(`/users/${id}`)

/** 팔로우 */
export const followUser = (id: string) => apiClient.post(`/users/${id}/follow`)

/** 언팔로우 */
export const unfollowUser = (id: string) => apiClient.delete(`/users/${id}/follow`)

/** 팔로워 목록 */
export const getFollowers = (id: string, page = 1) =>
  apiClient.get(`/users/${id}/followers?page=${page}`)

/** 팔로잉 목록 */
export const getFollowing = (id: string, page = 1) =>
  apiClient.get(`/users/${id}/following?page=${page}`)
