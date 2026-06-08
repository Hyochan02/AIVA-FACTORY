/**
 * AIVA FACTORY · API 클라이언트 (native fetch 기반)
 * axios 대신 브라우저 내장 fetch 사용 → 추가 패키지 불필요
 */

const BASE_URL = '/api'

const authHeader = (): Record<string, string> => {
  const token = localStorage.getItem('aiva_token')
  return token ? { Authorization: `Bearer ${token}` } : {}
}

const handleRes = async (res: Response) => {
  if (res.status === 401) {
    localStorage.removeItem('aiva_token')
    window.location.href = '/login'
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
    }).then(handleRes),

  post: (path: string, body?: unknown) =>
    fetch(`${BASE_URL}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeader() },
      body: JSON.stringify(body),
    }).then(handleRes),

  patch: (path: string, body?: unknown) =>
    fetch(`${BASE_URL}${path}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', ...authHeader() },
      body: JSON.stringify(body),
    }).then(handleRes),

  put: (path: string, body?: unknown) =>
    fetch(`${BASE_URL}${path}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...authHeader() },
      body: JSON.stringify(body),
    }).then(handleRes),

  delete: (path: string) =>
    fetch(`${BASE_URL}${path}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json', ...authHeader() },
    }).then(handleRes),
}

export default apiClient
