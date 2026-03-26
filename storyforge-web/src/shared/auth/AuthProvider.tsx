import type { ReactNode } from 'react'
import { useCallback, useEffect, useMemo, useState } from 'react'

import { authApi } from '@/shared/api/services'
import type { AuthSession, UserInfo } from '@/shared/api/types'
import { clearSession, setUnauthorizedHandler, updateSession } from '@/shared/api/client'
import { readStoredSession } from '@/shared/auth/storage'
import { AuthContext } from '@/shared/auth/auth-context'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserInfo | null>(null)
  const [loading, setLoading] = useState(true)

  const logout = useCallback(() => {
    clearSession()
    setUser(null)
  }, [])

  const refreshMe = useCallback(async () => {
    const storedSession = readStoredSession()
    if (!storedSession) {
      setUser(null)
      return
    }

    const me = await authApi.me()
    setUser(me)
  }, [])

  const login = useCallback((session: AuthSession) => {
    updateSession(session)
    setUser(session.userInfo)
  }, [])

  useEffect(() => {
    setUnauthorizedHandler(logout)
    return () => setUnauthorizedHandler(null)
  }, [logout])

  useEffect(() => {
    const bootstrap = async () => {
      try {
        await refreshMe()
      } catch {
        logout()
      } finally {
        setLoading(false)
      }
    }

    void bootstrap()
  }, [logout, refreshMe])

  const value = useMemo(
    () => ({
      user,
      loading,
      isAuthenticated: Boolean(user),
      login,
      logout,
      refreshMe,
    }),
    [loading, login, logout, refreshMe, user],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
