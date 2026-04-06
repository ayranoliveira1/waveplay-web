import { Play, Film } from 'lucide-react'
import { TMDB_IMAGE_SIZES } from '../constants/api'
import type { CatalogEpisode } from '../types/api'

interface EpisodeCardProps {
  episode: CatalogEpisode
  seriesId: number
  disabled?: boolean
  onPlay?: (season: number, episode: number) => void
}

function formatRuntime(minutes: number | null) {
  if (!minutes) return null
  if (minutes < 60) return `${minutes}min`
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return m > 0 ? `${h}h ${m}min` : `${h}h`
}

export function EpisodeCard({ episode, disabled = false, onPlay }: EpisodeCardProps) {
  const content = (
    <div className="flex gap-3 sm:gap-4 group">
      {/* Thumbnail */}
      <div className="relative flex-shrink-0 w-28 sm:w-36 md:w-52 lg:w-60 aspect-video rounded-lg overflow-hidden bg-surface">
        {episode.stillPath ? (
          <img
            src={`${TMDB_IMAGE_SIZES.still.medium}${episode.stillPath}`}
            alt={episode.name}
            loading="lazy"
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="h-full w-full flex items-center justify-center">
            <Film size={24} className="text-text-muted" />
          </div>
        )}
        {!disabled && (
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <Play size={24} className="text-text fill-text" />
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0 py-0.5">
        <div className="flex items-baseline gap-2 mb-1">
          <span className="text-xs text-text-muted">E{episode.episodeNumber}</span>
          <h4 className="text-sm font-medium text-text truncate">{episode.name}</h4>
        </div>
        {episode.runtime && (
          <span className="text-xs text-text-muted">{formatRuntime(episode.runtime)}</span>
        )}
        {episode.overview && (
          <p className="mt-1 text-xs text-text-muted line-clamp-2">{episode.overview}</p>
        )}
      </div>
    </div>
  )

  if (disabled) {
    return <div className="opacity-60">{content}</div>
  }

  return (
    <button
      type="button"
      onClick={() => onPlay?.(episode.seasonNumber, episode.episodeNumber)}
      className="block w-full text-left hover:bg-surface/50 rounded-lg p-2 -mx-2 transition-colors cursor-pointer"
    >
      {content}
    </button>
  )
}
