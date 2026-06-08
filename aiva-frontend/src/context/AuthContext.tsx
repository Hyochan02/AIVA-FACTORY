/**
 * AIVA FACTORY · 전역 인증 컨텍스트
 *
 * [역할]
 * - 앱 전체의 로그인 상태(user, loading)를 하나의 저장소에서 관리
 * - login / register / logout / refreshUser 액션 제공
 *
 * [사용법]
 *   const { user, login, logout } = useAuth()
 *
 * [Best Practice]
 *   Context + Provider 패턴: 전역 상태를 props drilling 없이 모든 컴포넌트에서 읽을 수 있습니다.
 *   AuthProvider를 App 최상단에서 감싸면 모든 자식 컴포넌트에서 useAuth()로 접근 가능합니다.
 */
import React, {
  createContext, useContext, useState,
  useEffect, useCallback, type ReactNode,
} from 'react'
import type { User } from '../types'
import {
  login as apiLogin,
  register as apiRegister,
  logout as apiLogout,
  getMe,
  type LoginPayload,
  type RegisterPayload,
} from '../api/auth'

// ── 컨텍스트 타입 ─────────────────────────────────────────
interface AuthContextValue {
  user:        User | null     // 로그인한 유저 객체 (null = 미로그인)
  loading:     boolean         // 초기 인증 확인 중 여부 (앱 최초 로드 시)
  login:       (payload: LoginPayload) => Promise<void>
  register:    (payload: RegisterPayload) => Promise<void>
  logout:      () => void
  refreshUser: () => Promise<void>  // 서버에서 최신 유저 정보를 다시 가져옴
}

const AuthContext = createContext<AuthContextValue | null>(null)

// ── AuthProvider ─────────────────────────────────────────
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser]       = useState<User | null>(null)
  const [loading, setLoading] = useState(true)  // 앱 최초 로드 시 true

  /**
   * /api/auth/me 호출로 현재 토큰에 해당하는 유저 정보를 새로 조회합니다.
   * 토큰이 만료됐거나 유효하지 않으면 자동으로 토큰을 제거합니다.
   */
  const refreshUser = useCallback(async () => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const res = await getMe() as any
      // 백엔드 응답 구조: { success: true, data: { user: {...} } } 또는 { data: {...} }
      const u: User = res?.data?.user ?? res?.data ?? null
      setUser(u)
    } catch {
      setUser(null)
      localStorage.removeItem('aiva_token')
    }
  }, [])

  // 앱 최초 마운트: localStorage에 토큰이 있으면 유저 정보 조회
  useEffect(() => {
    const token = localStorage.getItem('aiva_token')
    if (token) {
      refreshUser().finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [refreshUser])

  const login = async (payload: LoginPayload) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const res = await apiLogin(payload) as any  // auth.ts가 토큰을 localStorage에 저장함
    const u: User = res?.data?.user ?? res?.data ?? null
    setUser(u)
  }

  const register = async (payload: RegisterPayload) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const res = await apiRegister(payload) as any
    const u: User = res?.data?.user ?? res?.data ?? null
    setUser(u)
  }

  const logout = () => {
    setUser(null)
    apiLogout()  // localStorage 토큰 제거 + /login 리다이렉트
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  )
}

// ── useAuth 훅 ────────────────────────────────────────────
export const useAuth = (): AuthContextValue => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth는 <AuthProvider> 안에서만 사용할 수 있습니다.')
  return ctx
}
