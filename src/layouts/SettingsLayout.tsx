import { useState } from 'react'
import { Outlet, NavLink } from 'react-router'
import {
  User,
  Users,
  CreditCard,
  LogOut,
  Layers,
  Smartphone,
} from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { useProfile } from '../hooks/useProfile'
import { PROFILE_COLORS, getInitials } from '../constants/theme'

export function SettingsLayout() {
  const { signOut } = useAuth()
  const { activeProfile, profiles } = useProfile()
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)

  const profileIndex = profiles.findIndex((p) => p.id === activeProfile?.id)
  const profileColor = PROFILE_COLORS[(profileIndex >= 0 ? profileIndex : 0) % PROFILE_COLORS.length]

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
      isActive
        ? 'bg-primary/10 text-primary'
        : 'text-text-muted hover:text-text hover:bg-surface/50'
    }`

  return (
    <div className="md:flex md:gap-8 py-6">
      {/* Desktop sidebar */}
      <aside className="hidden md:block w-60 shrink-0">
        {/* Profile */}
        {activeProfile && (
          <div className="flex items-center gap-3 mb-6">
            <div
              className="h-11 w-11 rounded-full flex items-center justify-center text-sm font-bold text-text shrink-0"
              style={{ backgroundColor: profileColor }}
            >
              {getInitials(activeProfile.name)}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-text truncate">{activeProfile.name}</p>
              <p className="text-xs text-text-muted">Perfil ativo</p>
            </div>
          </div>
        )}

        {/* Nav */}
        <nav className="space-y-1">
          <NavLink to="/settings" end className={linkClass}>
            <User size={18} />
            Perfil
          </NavLink>
          <NavLink to="/settings/account" className={linkClass}>
            <Layers size={18} />
            Conta
          </NavLink>
          <NavLink to="/settings/plans" className={linkClass}>
            <CreditCard size={18} />
            Planos
          </NavLink>
          <NavLink to="/profiles" className={linkClass}>
            <Users size={18} />
            Gerenciar perfis
          </NavLink>
          <NavLink to="/download" className={linkClass}>
            <Smartphone size={18} />
            Baixar app
          </NavLink>

          <div className="pt-2">
            {!showLogoutConfirm ? (
              <button
                onClick={() => setShowLogoutConfirm(true)}
                className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer w-full"
              >
                <LogOut size={18} />
                Sair
              </button>
            ) : (
              <div className="px-4 py-2.5">
                <p className="text-xs text-text-muted mb-2">Tem certeza?</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowLogoutConfirm(false)}
                    className="h-8 px-3 rounded-lg bg-surface text-xs font-medium text-text hover:bg-border transition-colors cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={signOut}
                    className="h-8 px-3 rounded-lg bg-red-500/20 text-xs font-medium text-red-400 hover:bg-red-500/30 transition-colors cursor-pointer"
                  >
                    Sair
                  </button>
                </div>
              </div>
            )}
          </div>
        </nav>
      </aside>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <Outlet />
      </div>
    </div>
  )
}
