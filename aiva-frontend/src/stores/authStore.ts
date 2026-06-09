import { create } from 'zustand'
import type { User, LoginPayload, RegisterPayload } from '../types/auth'
import { postLogin } from '../api/auth/postLogin'
import { postRegister } from '../api/auth/postRegister'
import { postLogout } from '../api/auth/postLogout'
import { getMe } from '../api/auth/getMe'

interface AuthStore {
  user:        User | null
  loading:     boolean
  init:        () => Promise<void>
  login:       (payload: LoginPayload) => Promise<void>
  register:    (payload: RegisterPayload) => Promise<void>
  logout:      () => void
  refreshUser: () => Promise<void>
}

export const useAuthStore = create<AuthStore>((set) => ({
  user:    null,
  loading: true,

  init: async () => {
    const token = localStorage.getItem('aiva_token')
    if (!token) { set({ loading: false }); return }
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const res = await getMe() as any
      const u: User = res?.data?.user ?? res?.data ?? null
      set({ user: u, loading: false })
    } catch {
      localStorage.removeItem('aiva_token')
      set({ user: null, loading: false })
    }
  },

  refreshUser: async () => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const res = await getMe() as any
      const u: User = res?.data?.user ?? res?.data ?? null
      set({ user: u })
    } catch {
      localStorage.removeItem('aiva_token')
      set({ user: null })
    }
  },

  login: async (payload) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const res = await postLogin(payload) as any
    const u: User = res?.data?.user ?? res?.data ?? null
    set({ user: u })
  },

  register: async (payload) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const res = await postRegister(payload) as any
    const u: User = res?.data?.user ?? res?.data ?? null
    set({ user: u })
  },

  logout: () => {
    set({ user: null })
    postLogout()
  },
}))
