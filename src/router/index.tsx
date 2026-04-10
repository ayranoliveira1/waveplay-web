import { createBrowserRouter } from 'react-router'
import { ProtectedRoute } from './ProtectedRoute'
import { PublicRoute } from './PublicRoute'
import { ProfileRoute } from './ProfileRoute'
import { AdminRoute } from './AdminRoute'
import { AuthLayout } from '../layouts/AuthLayout'
import { AppLayout } from '../layouts/AppLayout'
import { SettingsLayout } from '../layouts/SettingsLayout'
import { AdminLayout } from '../layouts/AdminLayout'
import { LoginPage } from '../pages/LoginPage'
import { RegisterPage } from '../pages/RegisterPage'
import { ForgotPasswordPage } from '../pages/ForgotPasswordPage'
import { ResetPasswordPage } from '../pages/ResetPasswordPage'
import { ProfileSelectionPage } from '../pages/ProfileSelectionPage'
import { ProfileFormPage } from '../pages/ProfileFormPage'
import { LandingPage } from '../pages/LandingPage'
import { NotFoundPage } from '../pages/NotFoundPage'
import { PlansPage } from '../pages/PlansPage'
import { SettingsPage } from '../pages/SettingsPage'
import { AccountPage } from '../pages/AccountPage'
import { HomePage } from '../pages/HomePage'
import { MoviesPage } from '../pages/MoviesPage'
import { SeriesPage } from '../pages/SeriesPage'
import { SearchPage } from '../pages/SearchPage'
import { MovieDetailPage } from '../pages/MovieDetailPage'
import { SeriesDetailPage } from '../pages/SeriesDetailPage'
import { AdminDashboardPage } from '../pages/admin/AdminDashboardPage'
import { AdminUsersPage } from '../pages/admin/AdminUsersPage'


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
              { path: '/browse/search', element: <SearchPage /> },
              { path: '/browse/movie/:id', element: <MovieDetailPage /> },
              { path: '/browse/series/:id', element: <SeriesDetailPage /> },
              {
                element: <SettingsLayout />,
                children: [
                  { path: '/settings', element: <SettingsPage /> },
                  { path: '/settings/account', element: <AccountPage /> },
                  { path: '/settings/plans', element: <PlansPage /> },
                ],
              },
            ],
          },
        ],
      },
    ],
  },

  // Painel admin (ProtectedRoute + AdminRoute — sem ProfileRoute)
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <AdminRoute />,
        children: [
          {
            element: <AdminLayout />,
            children: [
              {
                path: '/admin',
                element: <AdminDashboardPage />,
              },
              {
                path: '/admin/users',
                element: <AdminUsersPage />,
              },
              {
                path: '/admin/users/:id',
                element: (
                  <div className="text-text">
                    User detail em breve (Task 18)
                  </div>
                ),
              },
              {
                path: '/admin/plans',
                element: (
                  <div className="text-text">Plans em breve (Task 19)</div>
                ),
              },
            ],
          },
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
