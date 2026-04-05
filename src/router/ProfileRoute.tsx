import { Navigate, Outlet } from 'react-router'
import { useProfile } from '../hooks/useProfile'

export function ProfileRoute() {
  const { activeProfile, isLoading } = useProfile()

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  if (!activeProfile) {
    return <Navigate to="/profiles" replace />
  }

  return <Outlet />
}
