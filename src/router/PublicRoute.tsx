import { Navigate, Outlet } from 'react-router'
import { useAuth } from '../hooks/useAuth'
import { useProfile } from '../hooks/useProfile'

export function PublicRoute() {
  const { isAuthenticated, isLoading } = useAuth()
  const { activeProfile } = useProfile()

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  if (isAuthenticated && activeProfile) {
    return <Navigate to="/browse" replace />
  }

  if (isAuthenticated && !activeProfile) {
    return <Navigate to="/profiles" replace />
  }

  return <Outlet />
}
