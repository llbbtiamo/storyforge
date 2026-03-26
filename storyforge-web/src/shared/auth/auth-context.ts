import { createContext } from 'react'

import type { AuthSession, UserInfo } from '@/shared/api/types'

export interface AuthContextValue {
  user: UserInfo | null
  loading: boolean
  isAuthenticated: boolean
  login: (session: AuthSession) => void
  logout: () => void
  refreshMe: () => Promise<void>
}

export const AuthContext = createContext<AuthContextValue | null>(null)
