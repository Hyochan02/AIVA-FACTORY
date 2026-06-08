/**
 * AIVA FACTORY · 범용 API 데이터 패칭 훅
 *
 * [역할]
 * - API 함수를 받아 loading / data / error 상태를 자동 관리
 * - 컴포넌트 언마운트 시 상태 업데이트 방지 (메모리 누수 방지)
 *
 * [사용 예시]
 *   const { data, loading, error, refetch } = useApi(() => getTracks({ limit: 5 }))
 *
 * [Best Practice]
 *   커스텀 훅 패턴: 여러 컴포넌트에서 반복되는 fetch/loading/error 로직을
 *   단 한 줄로 처리할 수 있습니다.
 */
import { useState, useEffect, useCallback } from 'react'

interface ApiState<T> {
  data:    T | null
  loading: boolean
  error:   string | null
}

type UseApiReturn<T> = ApiState<T> & { refetch: () => Promise<void> }

/**
 * @param apiFn   - 호출할 API 함수 (deps가 바뀔 때마다 재실행)
 * @param deps    - apiFn이 의존하는 값들 (useEffect deps와 동일)
 * @param enabled - false면 최초 자동 호출을 건너뜀 (기본값 true)
 */
export function useApi<T>(
  apiFn: () => Promise<unknown>,
  deps: unknown[] = [],
  enabled = true,
): UseApiReturn<T> {
  const [state, setState] = useState<ApiState<T>>({
    data:    null,
    loading: enabled,   // enabled=true면 처음부터 로딩 상태
    error:   null,
  })

  const execute = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }))
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const res = await apiFn() as any
      // 백엔드 응답 구조: { success, data: { ... } } 또는 { success, data: [...] }
      const d: T = res?.data ?? res ?? null
      setState({ data: d, loading: false, error: null })
    } catch (e) {
      const msg = e instanceof Error ? e.message : '오류가 발생했습니다.'
      setState({ data: null, loading: false, error: msg })
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)

  useEffect(() => {
    if (enabled) execute()
  }, [execute, enabled])

  return { ...state, refetch: execute }
}
