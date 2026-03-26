import { Navigate, Outlet, useLocation } from 'react-router-dom'

import { LoadingPage } from '@/app/router/LoadingPage'
import { useAuth } from '@/shared/auth/useAuth'

export function ProtectedRoute() {
  const { isAuthenticated, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return <LoadingPage />
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  return <Outlet />
}
