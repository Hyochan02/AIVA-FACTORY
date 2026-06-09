import { useQuery } from '@tanstack/react-query'
import { getUserProfile } from '../../api/users/getUserProfile'

export const useGetUserProfile = (userId: string) => {
  return useQuery({
    queryKey: ['userProfile', userId],
    queryFn: async () => (await getUserProfile(userId)).data,
    enabled: !!userId,
  })
}
