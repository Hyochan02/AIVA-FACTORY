import { useMutation } from '@tanstack/react-query'
import { postResetPassword } from '../../api/auth/postResetPassword'

interface ResetPasswordVariables {
  token: string
  newPassword: string
}

export const usePostResetPassword = () => {
  return useMutation<void, Error, ResetPasswordVariables>({
    mutationFn: async (variables) => { await postResetPassword(variables) },
  })
}
