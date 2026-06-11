import { useQuery } from '@tanstack/react-query'
import { getStems } from '../../api/tracks/getStems'
import type { Stem } from '../../types/track'

// 트랙의 악기별 스템(track_stems) 목록 조회.
// 생성 완료 시 백엔드가 자동으로 12스템 분리를 요청해두므로,
// done 상태인 트랙이라면 보통 곧바로 (또는 약간의 지연 후) 스템이 채워진다.
export const useGetStems = (trackId: string) => {
  return useQuery<Stem[]>({
    queryKey: ['stems', trackId],
    queryFn: async () => (await getStems(trackId)).data.stems ?? [],
    enabled: !!trackId,
  })
}
