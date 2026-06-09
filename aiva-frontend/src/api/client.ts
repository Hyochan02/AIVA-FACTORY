/**
 * AIVA FACTORY · API 클라이언트 (native fetch 기반)
 * axios 대신 브라우저 내장 fetch 사용 → 추가 패키지 불필요
 */

// 개발: VITE_API_BASE_URL 미설정 → '/api' (Vite proxy가 처리)
// 프로덕션: VITE_API_BASE_URL=https://api.aiva-factory.p-e.kr → 직접 호출
const BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? '') + '/api'

const authHeader = (): Record<string, string> => {
  const token = localStorage.getItem('aiva_token')
  return token ? { Authorization: `Bearer ${token}` } : {}
}

const handleRes = async (res: Response, path?: string) => {
  if (res.status === 401) {
    // /auth 경로(로그인·회원가입) 외에는 토큰 삭제 안 함 — 컨테이너 재시작 등 일시적 오류로 강제 로그아웃되지 않도록
    const isAuthRoute = path?.startsWith('/auth')
    if (isAuthRoute) {
      localStorage.removeItem('aiva_token')
      window.location.href = '/login'
    }
  }
  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: res.statusText }))
    throw new Error((body as { error?: string }).error ?? res.statusText)
  }
  return res.json()
}

const apiClient = {
  get: (path: string) =>
    fetch(`${BASE_URL}${path}`, {
      headers: { 'Content-Type': 'application/json', ...authHeader() },
    }).then(r => handleRes(r, path)),

  post: (path: string, body?: unknown) =>
    fetch(`${BASE_URL}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeader() },
      body: JSON.stringify(body),
    }).then(r => handleRes(r, path)),

  patch: (path: string, body?: unknown) =>
    fetch(`${BASE_URL}${path}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', ...authHeader() },
      body: JSON.stringify(body),
    }).then(r => handleRes(r, path)),

  put: (path: string, body?: unknown) =>
    fetch(`${BASE_URL}${path}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...authHeader() },
      body: JSON.stringify(body),
    }).then(r => handleRes(r, path)),

  delete: (path: string) =>
    fetch(`${BASE_URL}${path}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json', ...authHeader() },
    }).then(r => handleRes(r, path)),
}

export default apiClient
