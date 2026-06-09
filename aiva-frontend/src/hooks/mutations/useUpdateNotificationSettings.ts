import { useMutation, useQueryClient } from '@tanstack/react-query'
import { updateNotificationSettings } from '../../api/notifications/updateNotificationSettings'
import type { NotificationSettings } from '../../types/notification'

export const useUpdateNotificationSettings = () => {
  const queryClient = useQueryClient()

  return useMutation<void, Error, Partial<NotificationSettings>>({
    mutationFn: async (data) => { await updateNotificationSettings(data) },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notificationSettings'] })
    },
  })
}
