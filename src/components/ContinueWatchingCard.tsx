import { Link } from 'react-router'
import { Play, Film } from 'lucide-react'
import { TMDB_IMAGE_SIZES } from '../constants/api'
import { formatTime } from '../hooks/useProgress'
import type { HistoryItem } from '../hooks/useHistory'

interface ContinueWatchingCardProps {
  item: HistoryItem
}

export function ContinueWatchingCard({ item }: ContinueWatchingCardProps) {
  const href =
    item.type === 'movie' ? `/browse/movie/${item.id}` : `/browse/series/${item.id}`

  const progress =
    item.progressSeconds && item.durationSeconds
      ? Math.min(item.progressSeconds / item.durationSeconds, 1)
      : 0

  const episodeLabel =
    item.type === 'series' && item.lastSeason != null && item.lastEpisode != null
      ? `T${item.lastSeason} E${item.lastEpisode}`
      : null

  const timeLabel = item.progressSeconds ? formatTime(item.progressSeconds) : null
  const durationLabel = item.durationSeconds ? formatTime(item.durationSeconds) : null

  return (
    <Link to={href} className="group flex-shrink-0 w-32 sm:w-36 md:w-40">
      <div className="relative aspect-[2/3] rounded-lg overflow-hidden bg-surface">
        {item.posterPath ? (
          <img
            src={`${TMDB_IMAGE_SIZES.poster.medium}${item.posterPath}`}
            alt={item.title}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="h-full w-full flex items-center justify-center">
            <Film size={32} className="text-text-muted" />
          </div>
        )}

        {/* Gradient overlay */}
        <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/85 to-transparent" />

        {/* Episode badge */}
        {episodeLabel && (
          <div className="absolute left-2 top-2 rounded-full bg-primary px-2 py-0.5">
            <span className="text-[10px] font-bold text-text">{episodeLabel}</span>
          </div>
        )}

        {/* Play + time overlay */}
        <div className="absolute bottom-2 left-2 right-2 flex items-center">
          <Play size={14} className="text-text fill-text flex-shrink-0" />
          {timeLabel && (
            <span className="ml-1.5 text-[10px] font-medium text-text/90 truncate">
              {timeLabel}
              {durationLabel ? ` / ${durationLabel}` : ''}
            </span>
          )}
        </div>

        {/* Progress bar */}
        {progress > 0 && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
            <div
              className="h-full bg-primary rounded-full"
              style={{ width: `${progress * 100}%` }}
            />
          </div>
        )}
      </div>

      <p className="mt-2 text-xs sm:text-sm text-text-muted line-clamp-1 group-hover:text-text transition-colors">
        {item.title}
      </p>
    </Link>
  )
}
