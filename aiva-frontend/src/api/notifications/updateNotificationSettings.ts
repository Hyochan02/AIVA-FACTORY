import apiClient from '../client'
import type { NotificationSettings } from '../../types/notification'

export const updateNotificationSettings = (settings: Partial<NotificationSettings>) =>
  apiClient.put('/notifications/settings', settings)
