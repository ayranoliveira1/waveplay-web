import { Outlet, NavLink } from 'react-router'
import { Home, Film, Tv, Search, User } from 'lucide-react'
import { useProfile } from '../hooks/useProfile'
import { PROFILE_COLORS, getInitials } from '../constants/theme'
import { ScrollToTop } from '../components/ScrollToTop'

const navLinks = [
  { to: '/browse', label: 'Home', icon: Home },
  { to: '/browse/movies', label: 'Filmes', icon: Film },
  { to: '/browse/series', label: 'Séries', icon: Tv },
  { to: '/browse/search', label: 'Busca', icon: Search },
] as const

const mobileNavLinks = navLinks.filter((l) => l.to !== '/browse/search')

export function AppLayout() {
  const { activeProfile, profiles } = useProfile()
  const profileIndex = profiles.findIndex((p) => p.id === activeProfile?.id)
  const profileColor = PROFILE_COLORS[(profileIndex >= 0 ? profileIndex : 0) % PROFILE_COLORS.length]

  return (
    <div className="min-h-screen bg-background">
      <ScrollToTop />

      {/* Mobile top bar */}
      <nav className="md:hidden flex items-center justify-between px-4 py-3 bg-background/80 backdrop-blur-sm sticky top-0 z-50 border-b border-border">
        <NavLink to="/browse" className="text-lg font-bold text-primary">
          WAVEPLAY
        </NavLink>
        <NavLink
          to="/browse/search"
          className={({ isActive }) =>
            `p-1.5 transition-colors ${isActive ? 'text-primary' : 'text-text-muted hover:text-text'}`
          }
        >
          <Search size={20} />
        </NavLink>
      </nav>

      {/* Desktop navbar */}
      <nav className="hidden md:flex items-center justify-between px-8 lg:px-12 py-4 bg-background/80 backdrop-blur-sm sticky top-0 z-50 border-b border-border">
        <div className="flex items-center gap-8">
          <NavLink to="/browse" className="text-xl font-bold text-primary">
            WAVEPLAY
          </NavLink>
          <div className="flex items-center gap-6">
            {navLinks.map(({ to, label }) => (
              <NavLink
                key={to}
                to={to}
                end={to === '/browse'}
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
          to="/settings"
          className="flex items-center gap-2 text-text-muted hover:text-text transition-colors"
        >
          {activeProfile ? (
            <>
              <div
                className="h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold text-text"
                style={{ backgroundColor: profileColor }}
              >
                {getInitials(activeProfile.name)}
              </div>
              <span className="text-sm">{activeProfile.name}</span>
            </>
          ) : (
            <User size={20} />
          )}
        </NavLink>
      </nav>

      {/* Content */}
      <main className="px-4 sm:px-6 md:px-8 lg:px-12 pb-20 md:pb-8 overflow-x-hidden">
        <Outlet />
      </main>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-surface border-t border-border flex items-center justify-around py-2 z-50">
        {mobileNavLinks.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/browse'}
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
        <NavLink
          to="/settings"
          className={({ isActive }) =>
            `flex flex-col items-center gap-1 px-3 py-1 transition-colors ${
              isActive ? 'text-primary' : 'text-text-muted'
            }`
          }
        >
          <User size={20} />
          <span className="text-[10px]">Perfil</span>
        </NavLink>
      </nav>
    </div>
  )
}
