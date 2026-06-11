import { useQuery } from '@tanstack/react-query'
import { getMixSettings } from '../../api/editor/getMixSettings'
import type { StemConfig } from '../../types/editor'

// 트랙에 저장된 믹스 설정(스템별 볼륨/뮤트/솔로) 조회.
// 저장된 적이 없으면 stemConfig는 null → useStemMixer가 기본값(전체 100%, 음소거/솔로 해제)을 사용한다.
export const useGetMixSettings = (trackId: string) => {
  return useQuery<StemConfig | null>({
    queryKey: ['mixSettings', trackId],
    queryFn: async () => (await getMixSettings(trackId)).data.stemConfig ?? null,
    enabled: !!trackId,
  })
}
