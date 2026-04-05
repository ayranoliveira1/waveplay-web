import { createBrowserRouter } from 'react-router'
import { ProtectedRoute } from './ProtectedRoute'
import { PublicRoute } from './PublicRoute'
import { ProfileRoute } from './ProfileRoute'
import { AuthLayout } from '../layouts/AuthLayout'
import { AppLayout } from '../layouts/AppLayout'

// Placeholder pages — serão implementadas nas tasks futuras
function Placeholder({ name }: { name: string }) {
  return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <p className="text-text-muted text-lg">{name}</p>
    </div>
  )
}

export const router = createBrowserRouter([
  // Landing (pública)
  {
    path: '/',
    element: <Placeholder name="LandingPage" />,
  },

  // Auth (PublicRoute guard)
  {
    element: <PublicRoute />,
    children: [
      {
        element: <AuthLayout />,
        children: [
          { path: '/auth/login', element: <Placeholder name="LoginPage" /> },
          { path: '/auth/register', element: <Placeholder name="RegisterPage" /> },
          { path: '/auth/forgot-password', element: <Placeholder name="ForgotPasswordPage" /> },
          { path: '/auth/reset-password', element: <Placeholder name="ResetPasswordPage" /> },
        ],
      },
    ],
  },

  // Seleção de perfil (ProtectedRoute guard)
  {
    element: <ProtectedRoute />,
    children: [
      { path: '/profiles', element: <Placeholder name="ProfileSelectionPage" /> },
      { path: '/profiles/new', element: <Placeholder name="ProfileFormPage (new)" /> },
      { path: '/profiles/:id/edit', element: <Placeholder name="ProfileFormPage (edit)" /> },
    ],
  },

  // App privado (ProtectedRoute + ProfileRoute guards)
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <ProfileRoute />,
        children: [
          {
            element: <AppLayout />,
            children: [
              { path: '/browse', element: <Placeholder name="HomePage" /> },
              { path: '/browse/movies', element: <Placeholder name="MoviesPage" /> },
              { path: '/browse/series', element: <Placeholder name="SeriesPage" /> },
              { path: '/browse/search', element: <Placeholder name="SearchPage" /> },
              { path: '/browse/movie/:id', element: <Placeholder name="MovieDetailPage" /> },
              { path: '/browse/series/:id', element: <Placeholder name="SeriesDetailPage" /> },
              { path: '/settings', element: <Placeholder name="SettingsPage" /> },
              { path: '/settings/account', element: <Placeholder name="AccountPage" /> },
              { path: '/settings/plans', element: <Placeholder name="PlansPage" /> },
            ],
          },
          // Player sem navbar (fullscreen)
          { path: '/watch/:type/:id', element: <Placeholder name="PlayerPage" /> },
        ],
      },
    ],
  },

  // 404
  {
    path: '*',
    element: (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
        <h1 className="text-6xl font-bold text-primary">404</h1>
        <p className="text-text-muted">Página não encontrada</p>
        <a href="/" className="text-primary hover:text-primary-light transition-colors">
          Voltar para home
        </a>
      </div>
    ),
  },
])
