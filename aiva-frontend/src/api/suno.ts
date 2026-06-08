/**
 * Suno AI 음악 생성 API 함수 (2차 개발에서 실제 연동)
 */
import apiClient from './client'
import type { GenerationRequest } from '../types'

export const generateMusic = (req: GenerationRequest) =>
  apiClient.post('/suno/generate', req)

export const getGenerationStatus = (taskId: string) =>
  apiClient.get(`/suno/status/${taskId}`)

export const pollUntilDone = (
  taskId: string,
  onProgress?: (p: number) => void,
): Promise<{ audioUrl: string }> =>
  new Promise((resolve, reject) => {
    const id = setInterval(async () => {
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const res = await getGenerationStatus(taskId) as any
        onProgress?.(res.data?.progress ?? 0)
        if (res.data?.status === 'done') {
          clearInterval(id)
          resolve({ audioUrl: res.data.audioUrl })
        }
      } catch (err) {
        clearInterval(id)
        reject(err)
      }
    }, 2000)
  })
