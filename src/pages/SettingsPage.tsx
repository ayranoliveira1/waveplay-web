import { useState, useMemo } from 'react'
import { Link } from 'react-router'
import { useQuery } from '@tanstack/react-query'
import {
  User,
  Users,
  CreditCard,
  LogOut,
  ChevronRight,
  Inbox,
  Smartphone,
} from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { useProfile } from '../hooks/useProfile'
import { useHistory, type HistoryItem } from '../hooks/useHistory'
import { library } from '../services/library'
import type { LibraryItem } from '../services/library'
import { PROFILE_COLORS, getInitials } from '../constants/theme'
import { Carousel } from '../components/Carousel'
import { MediaCard } from '../components/MediaCard'
import { ContinueWatchingCard } from '../components/ContinueWatchingCard'
import type { CatalogItem } from '../types/api'

function toMediaItem(item: LibraryItem): CatalogItem {
  return {
    id: item.tmdbId,
    title: item.title,
    posterPath: item.posterPath,
    backdropPath: item.backdropPath,
    rating: item.rating,
    type: item.type,
    releaseDate: '',
  }
}

export function SettingsPage() {
  const { signOut } = useAuth()
  const { activeProfile, profiles } = useProfile()
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)

  const profileIndex = profiles.findIndex((p) => p.id === activeProfile?.id)
  const profileColor = PROFILE_COLORS[(profileIndex >= 0 ? profileIndex : 0) % PROFILE_COLORS.length]
  const profileId = activeProfile?.id

  // Data
  const { history, isLoading: historyLoading } = useHistory()

  const continueWatching = useMemo(
    () =>
      history
        .map((h) => {
          if (!h.progressSeconds || !h.durationSeconds) return null
          const percent = h.progressSeconds / h.durationSeconds

          if (percent < 0.9) return h

          if (h.type === 'series' && h.lastEpisode != null) {
            return {
              ...h,
              lastEpisode: h.lastEpisode + 1,
              progressSeconds: 0,
              durationSeconds: 0,
            }
          }

          return null
        })
        .filter((h): h is HistoryItem => h !== null),
    [history],
  )

  const { data: favorites, isLoading: favoritesLoading } = useQuery({
    queryKey: ['library', 'favorites', profileId],
    queryFn: async () => {
      const res = await library.getFavorites(profileId!)
      return res.success ? res.data.favorites : []
    },
    enabled: !!profileId,
  })

  const { data: watchlist, isLoading: watchlistLoading } = useQuery({
    queryKey: ['library', 'watchlist', profileId],
    queryFn: async () => {
      const res = await library.getWatchlist(profileId!)
      return res.success ? res.data.items : []
    },
    enabled: !!profileId,
  })

  const hasContent =
    continueWatching.length > 0 ||
    (favorites && favorites.length > 0) ||
    (watchlist && watchlist.length > 0)
  const isLoading = historyLoading || favoritesLoading || watchlistLoading

  return (
    <div>
      {/* Mobile profile header (hidden on desktop — sidebar has it) */}
      {activeProfile && (
        <div className="flex items-center gap-3 mb-4 md:hidden">
          <div
            className="h-12 w-12 rounded-full flex items-center justify-center text-sm font-bold text-text"
            style={{ backgroundColor: profileColor }}
          >
            {getInitials(activeProfile.name)}
          </div>
          <div>
            <p className="text-base font-semibold text-text">{activeProfile.name}</p>
            <p className="text-xs text-text-muted">Perfil ativo</p>
          </div>
        </div>
      )}

      {/* Carousels */}
      {(historyLoading || continueWatching.length > 0) && (
        <Carousel title="Continuar Assistindo" isLoading={historyLoading}>
          {continueWatching.slice(0, 10).map((item) => (
            <ContinueWatchingCard
              key={`continue-${item.id}-${item.type}-${item.lastSeason ?? 0}-${item.lastEpisode ?? 0}`}
              item={item}
            />
          ))}
        </Carousel>
      )}

      {(favoritesLoading || (favorites && favorites.length > 0)) && (
        <Carousel title="Favoritos" isLoading={favoritesLoading}>
          {favorites?.map((item) => (
            <MediaCard key={`fav-${item.tmdbId}-${item.type}`} item={toMediaItem(item)} />
          ))}
        </Carousel>
      )}

      {(watchlistLoading || (watchlist && watchlist.length > 0)) && (
        <Carousel title="Assistir Depois" isLoading={watchlistLoading}>
          {watchlist?.map((item) => (
            <MediaCard key={`wl-${item.tmdbId}-${item.type}`} item={toMediaItem(item)} />
          ))}
        </Carousel>
      )}

      {!isLoading && !hasContent && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Inbox size={48} className="text-text-muted mb-4" />
          <h2 className="text-base font-semibold text-text mb-1">Nada por aqui ainda</h2>
          <p className="text-sm text-text-muted max-w-xs">
            Seus favoritos, watchlist e histórico aparecerão aqui
          </p>
        </div>
      )}

      {/* Mobile settings menu (hidden on desktop — sidebar has it) */}
      <div className="md:hidden mt-6">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-text-muted mb-2">
          Configurações
        </h2>
        <div className="bg-surface rounded-xl overflow-hidden">
          <Link
            to="/settings/account"
            className="flex items-center gap-3 px-4 py-3.5 border-b border-border hover:bg-surface/80 transition-colors"
          >
            <User size={20} className="text-text-muted" />
            <span className="flex-1 text-sm font-medium text-text">Conta</span>
            <ChevronRight size={16} className="text-text-muted" />
          </Link>

          <Link
            to="/profiles"
            className="flex items-center gap-3 px-4 py-3.5 border-b border-border hover:bg-surface/80 transition-colors"
          >
            <Users size={20} className="text-text-muted" />
            <span className="flex-1 text-sm font-medium text-text">Gerenciar perfis</span>
            <ChevronRight size={16} className="text-text-muted" />
          </Link>

          <Link
            to="/settings/plans"
            className="flex items-center gap-3 px-4 py-3.5 border-b border-border hover:bg-surface/80 transition-colors"
          >
            <CreditCard size={20} className="text-text-muted" />
            <span className="flex-1 text-sm font-medium text-text">Planos</span>
            <ChevronRight size={16} className="text-text-muted" />
          </Link>

          <Link
            to="/download"
            className="flex items-center gap-3 px-4 py-3.5 border-b border-border hover:bg-surface/80 transition-colors"
          >
            <Smartphone size={20} className="text-text-muted" />
            <span className="flex-1 text-sm font-medium text-text">
              Baixar app
            </span>
            <ChevronRight size={16} className="text-text-muted" />
          </Link>

          {!showLogoutConfirm ? (
            <button
              onClick={() => setShowLogoutConfirm(true)}
              className="flex items-center gap-3 px-4 py-3.5 w-full hover:bg-surface/80 transition-colors cursor-pointer"
            >
              <LogOut size={20} className="text-red-400" />
              <span className="flex-1 text-sm font-medium text-red-400 text-left">Sair</span>
            </button>
          ) : (
            <div className="px-4 py-3.5">
              <p className="text-sm text-text-muted mb-3">Tem certeza que deseja sair?</p>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowLogoutConfirm(false)}
                  className="h-9 px-4 rounded-lg bg-surface/80 text-sm font-medium text-text transition-colors hover:bg-border cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  onClick={signOut}
                  className="h-9 px-4 rounded-lg bg-red-500/20 text-sm font-medium text-red-400 transition-colors hover:bg-red-500/30 cursor-pointer"
                >
                  Sair
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
