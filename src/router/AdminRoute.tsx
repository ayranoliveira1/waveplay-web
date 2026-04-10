import { Navigate, Outlet } from 'react-router'
import { useAuth } from '../hooks/useAuth'

// Guard de UX para o painel admin (defense-in-depth — backend e autoridade).
// Ver docs/adr/0001-admin-frontend-rbac.md para a decisao arquitetural.
export function AdminRoute() {
  const { isAuthenticated, isLoading, user } = useAuth()

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth/login" replace />
  }

  // Checagem explicita — nunca confiar em truthy de role.
  if (user?.role !== 'admin') {
    return <Navigate to="/browse" replace />
  }

  return <Outlet />
}
