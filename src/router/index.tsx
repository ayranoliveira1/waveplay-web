import { createBrowserRouter } from 'react-router'
import { ProtectedRoute } from './ProtectedRoute'
import { PublicRoute } from './PublicRoute'
import { ProfileRoute } from './ProfileRoute'
import { AuthLayout } from '../layouts/AuthLayout'
import { AppLayout } from '../layouts/AppLayout'
import { LoginPage } from '../pages/LoginPage'
import { RegisterPage } from '../pages/RegisterPage'
import { ForgotPasswordPage } from '../pages/ForgotPasswordPage'
import { ResetPasswordPage } from '../pages/ResetPasswordPage'
import { ProfileSelectionPage } from '../pages/ProfileSelectionPage'
import { ProfileFormPage } from '../pages/ProfileFormPage'
import { LandingPage } from '../pages/LandingPage'
import { NotFoundPage } from '../pages/NotFoundPage'
import { HomePage } from '../pages/HomePage'
import { MoviesPage } from '../pages/MoviesPage'
import { SeriesPage } from '../pages/SeriesPage'
import { Placeholder } from '../components/Placeholder'

export const router = createBrowserRouter([
  // Landing (pública)
  {
    path: '/',
    element: <LandingPage />,
  },

  // Auth (PublicRoute guard)
  {
    element: <PublicRoute />,
    children: [
      {
        element: <AuthLayout />,
        children: [
          { path: '/auth/login', element: <LoginPage /> },
          { path: '/auth/register', element: <RegisterPage /> },
          { path: '/auth/forgot-password', element: <ForgotPasswordPage /> },
          { path: '/auth/reset-password', element: <ResetPasswordPage /> },
        ],
      },
    ],
  },

  // Seleção de perfil (ProtectedRoute guard)
  {
    element: <ProtectedRoute />,
    children: [
      { path: '/profiles', element: <ProfileSelectionPage /> },
      { path: '/profiles/new', element: <ProfileFormPage /> },
      { path: '/profiles/:id/edit', element: <ProfileFormPage /> },
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
              { path: '/browse', element: <HomePage /> },
              { path: '/browse/movies', element: <MoviesPage /> },
              { path: '/browse/series', element: <SeriesPage /> },
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
    element: <NotFoundPage />,
  },
])
