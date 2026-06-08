import apiClient from './client'

export interface NotificationSettings {
  gen: boolean
  credit: boolean
  like: boolean
  follow: boolean
  marketing: boolean
}

/** 알림 설정 조회 */
export const getNotificationSettings = () =>
  apiClient.get('/notifications/settings')

/** 알림 설정 변경 */
export const updateNotificationSettings = (settings: Partial<NotificationSettings>) =>
  apiClient.put('/notifications/settings', settings)
