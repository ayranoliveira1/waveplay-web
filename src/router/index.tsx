/* eslint-disable react-refresh/only-export-components */
import { lazy, Suspense, type ComponentType } from 'react'
import { createBrowserRouter } from 'react-router'
import { ProtectedRoute } from './ProtectedRoute'
import { PublicRoute } from './PublicRoute'
import { ProfileRoute } from './ProfileRoute'
import { AdminRoute } from './AdminRoute'
import { AuthLayout } from '../layouts/AuthLayout'
import { AppLayout } from '../layouts/AppLayout'
import { SettingsLayout } from '../layouts/SettingsLayout'
import { AdminLayout } from '../layouts/AdminLayout'
import { RouteFallback } from '../components/ui/RouteFallback'

// Rotas criticas para first paint — import estatico
import { LandingPage } from '../pages/LandingPage'
import { LoginPage } from '../pages/LoginPage'
import { NotFoundPage } from '../pages/NotFoundPage'

// Rotas lazy — carregam sob demanda
const RegisterPage = lazy(() =>
  import('../pages/RegisterPage').then((m) => ({ default: m.RegisterPage })),
)
const ForgotPasswordPage = lazy(() =>
  import('../pages/ForgotPasswordPage').then((m) => ({
    default: m.ForgotPasswordPage,
  })),
)
const ResetPasswordPage = lazy(() =>
  import('../pages/ResetPasswordPage').then((m) => ({
    default: m.ResetPasswordPage,
  })),
)
const ProfileSelectionPage = lazy(() =>
  import('../pages/ProfileSelectionPage').then((m) => ({
    default: m.ProfileSelectionPage,
  })),
)
const ProfileFormPage = lazy(() =>
  import('../pages/ProfileFormPage').then((m) => ({
    default: m.ProfileFormPage,
  })),
)
const HomePage = lazy(() =>
  import('../pages/HomePage').then((m) => ({ default: m.HomePage })),
)
const MoviesPage = lazy(() =>
  import('../pages/MoviesPage').then((m) => ({ default: m.MoviesPage })),
)
const SeriesPage = lazy(() =>
  import('../pages/SeriesPage').then((m) => ({ default: m.SeriesPage })),
)
const SearchPage = lazy(() =>
  import('../pages/SearchPage').then((m) => ({ default: m.SearchPage })),
)
const MovieDetailPage = lazy(() =>
  import('../pages/MovieDetailPage').then((m) => ({
    default: m.MovieDetailPage,
  })),
)
const SeriesDetailPage = lazy(() =>
  import('../pages/SeriesDetailPage').then((m) => ({
    default: m.SeriesDetailPage,
  })),
)
const SettingsPage = lazy(() =>
  import('../pages/SettingsPage').then((m) => ({ default: m.SettingsPage })),
)
const AccountPage = lazy(() =>
  import('../pages/AccountPage').then((m) => ({ default: m.AccountPage })),
)
const PlansPage = lazy(() =>
  import('../pages/PlansPage').then((m) => ({ default: m.PlansPage })),
)
const AdminDashboardPage = lazy(() =>
  import('../pages/admin/AdminDashboardPage').then((m) => ({
    default: m.AdminDashboardPage,
  })),
)
const AdminUsersPage = lazy(() =>
  import('../pages/admin/AdminUsersPage').then((m) => ({
    default: m.AdminUsersPage,
  })),
)
const AdminUserDetailPage = lazy(() =>
  import('../pages/admin/AdminUserDetailPage').then((m) => ({
    default: m.AdminUserDetailPage,
  })),
)
const AdminPlansPage = lazy(() =>
  import('../pages/admin/AdminPlansPage').then((m) => ({
    default: m.AdminPlansPage,
  })),
)

function withSuspense(Component: ComponentType) {
  return (
    <Suspense fallback={<RouteFallback />}>
      <Component />
    </Suspense>
  )
}

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
          { path: '/auth/register', element: withSuspense(RegisterPage) },
          {
            path: '/auth/forgot-password',
            element: withSuspense(ForgotPasswordPage),
          },
          {
            path: '/auth/reset-password',
            element: withSuspense(ResetPasswordPage),
          },
        ],
      },
    ],
  },

  // Seleção de perfil (ProtectedRoute guard)
  {
    element: <ProtectedRoute />,
    children: [
      { path: '/profiles', element: withSuspense(ProfileSelectionPage) },
      { path: '/profiles/new', element: withSuspense(ProfileFormPage) },
      { path: '/profiles/:id/edit', element: withSuspense(ProfileFormPage) },
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
              { path: '/browse', element: withSuspense(HomePage) },
              { path: '/browse/movies', element: withSuspense(MoviesPage) },
              { path: '/browse/series', element: withSuspense(SeriesPage) },
              { path: '/browse/search', element: withSuspense(SearchPage) },
              {
                path: '/browse/movie/:id',
                element: withSuspense(MovieDetailPage),
              },
              {
                path: '/browse/series/:id',
                element: withSuspense(SeriesDetailPage),
              },
              {
                element: <SettingsLayout />,
                children: [
                  { path: '/settings', element: withSuspense(SettingsPage) },
                  {
                    path: '/settings/account',
                    element: withSuspense(AccountPage),
                  },
                  {
                    path: '/settings/plans',
                    element: withSuspense(PlansPage),
                  },
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
                element: withSuspense(AdminDashboardPage),
              },
              {
                path: '/admin/users',
                element: withSuspense(AdminUsersPage),
              },
              {
                path: '/admin/users/:id',
                element: withSuspense(AdminUserDetailPage),
              },
              {
                path: '/admin/plans',
                element: withSuspense(AdminPlansPage),
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
