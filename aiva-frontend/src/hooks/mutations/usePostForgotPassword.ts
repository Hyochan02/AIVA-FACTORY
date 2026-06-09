import { useMutation } from '@tanstack/react-query'
import { postForgotPassword } from '../../api/auth/postForgotPassword'

export const usePostForgotPassword = () => {
  return useMutation<unknown, Error, string>({
    mutationFn: async (email) => (await postForgotPassword(email)).data,
  })
}
