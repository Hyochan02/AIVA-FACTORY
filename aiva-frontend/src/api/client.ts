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
    // 로그인·회원가입 시도 자체의 401은 "자격증명 오류"이므로 리다이렉트 없이 에러만 throw
    // 그 외 401은 토큰 만료 → 삭제 후 로그인 페이지로 이동
    const isCredentialAttempt = path === '/auth/login' || path === '/auth/register'
    if (!isCredentialAttempt) {
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
