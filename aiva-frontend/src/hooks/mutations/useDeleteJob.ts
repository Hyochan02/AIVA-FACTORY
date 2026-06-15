import { useMutation, useQueryClient } from '@tanstack/react-query'
import { deleteJob } from '../../api/editor/deleteJob'

export const useDeleteJob = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (jobId: string) => deleteJob(jobId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobHistory'] })
    },
  })
}
