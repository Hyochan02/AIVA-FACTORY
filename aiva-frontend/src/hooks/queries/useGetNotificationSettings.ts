import { useQuery } from '@tanstack/react-query'
import { getNotificationSettings } from '../../api/notifications/getNotificationSettings'
import type { NotificationSettings } from '../../types/notification'

export const useGetNotificationSettings = () => {
  return useQuery<NotificationSettings>({
    queryKey: ['notificationSettings'],
    queryFn: async () => (await getNotificationSettings()).data,
  })
}
