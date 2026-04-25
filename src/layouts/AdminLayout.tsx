import { Outlet, NavLink } from 'react-router'
import {
  LayoutDashboard,
  Users,
  Package,
  ArrowLeft,
  Smartphone,
} from 'lucide-react'

// Links do painel admin (ordem fixa).
const adminLinks = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/users', label: 'Usuários', icon: Users, end: false },
  { to: '/admin/plans', label: 'Planos', icon: Package, end: false },
  {
    to: '/admin/app-versions',
    label: 'App Mobile',
    icon: Smartphone,
    end: false,
  },
] as const

export function AdminLayout() {
  return (
    <div className="min-h-screen bg-background">
      {/* Mobile top bar */}
      <nav className="md:hidden flex items-center justify-between px-4 py-3 bg-background/80 backdrop-blur-sm sticky top-0 z-50 border-b border-border">
        <NavLink to="/admin" className="text-lg font-bold text-primary">
          WAVEPLAY ADMIN
        </NavLink>
        <NavLink
          to="/browse"
          className="flex items-center gap-1 text-text-muted hover:text-text transition-colors text-sm"
        >
          <ArrowLeft size={16} />
          <span>App</span>
        </NavLink>
      </nav>

      {/* Desktop navbar */}
      <nav className="hidden md:flex items-center justify-between px-8 lg:px-12 py-4 bg-background/80 backdrop-blur-sm sticky top-0 z-50 border-b border-border">
        <div className="flex items-center gap-8">
          <NavLink to="/admin" className="text-xl font-bold text-primary">
            WAVEPLAY ADMIN
          </NavLink>
          <div className="flex items-center gap-6">
            {adminLinks.map(({ to, label, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  `text-sm font-medium transition-colors ${
                    isActive ? 'text-text' : 'text-text-muted hover:text-text'
                  }`
                }
              >
                {label}
              </NavLink>
            ))}
          </div>
        </div>
        <NavLink
          to="/browse"
          className="flex items-center gap-2 text-text-muted hover:text-text transition-colors text-sm"
        >
          <ArrowLeft size={16} />
          <span>Voltar ao app</span>
        </NavLink>
      </nav>

      {/* Content */}
      <main className="px-4 sm:px-6 md:px-8 lg:px-12 pb-20 md:pb-8 overflow-x-hidden">
        <Outlet />
      </main>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-surface border-t border-border flex items-center justify-around py-2 z-50">
        {adminLinks.map(({ to, label, end, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 px-3 py-1 transition-colors ${
                isActive ? 'text-primary' : 'text-text-muted'
              }`
            }
          >
            <Icon size={20} />
            <span className="text-[10px]">{label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  )
}
