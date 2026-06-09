import { useMutation } from '@tanstack/react-query'
import { putPassword } from '../../api/auth/putPassword'

interface PutPasswordVariables {
  currentPassword: string
  newPassword: string
}

export const usePutPassword = () => {
  return useMutation<void, Error, PutPasswordVariables>({
    mutationFn: async (data) => { await putPassword(data) },
  })
}
