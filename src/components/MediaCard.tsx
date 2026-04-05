import { Link } from 'react-router'
import { Star, Film } from 'lucide-react'
import { TMDB_IMAGE_SIZES } from '../constants/api'
import type { CatalogItem } from '../types/api'

interface MediaCardProps {
  item: CatalogItem
  size?: 'sm' | 'md' | 'lg'
}

const sizeStyles = {
  sm: 'w-28 sm:w-32',
  md: 'w-32 sm:w-36 md:w-40',
  lg: 'w-36 sm:w-40 md:w-44 lg:w-48',
} as const

const posterSizes = {
  sm: TMDB_IMAGE_SIZES.poster.small,
  md: TMDB_IMAGE_SIZES.poster.medium,
  lg: TMDB_IMAGE_SIZES.poster.large,
} as const

export function MediaCard({ item, size = 'md' }: MediaCardProps) {
  const href =
    item.type === 'movie' ? `/browse/movie/${item.id}` : `/browse/series/${item.id}`

  return (
    <Link to={href} className={`group flex-shrink-0 ${sizeStyles[size]}`}>
      <div className="relative aspect-[2/3] rounded-lg overflow-hidden bg-surface">
        {item.posterPath ? (
          <img
            src={`${posterSizes[size]}${item.posterPath}`}
            alt={item.title}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="h-full w-full flex items-center justify-center">
            <Film size={32} className="text-text-muted" />
          </div>
        )}

        {/* Rating badge */}
        {item.rating > 0 && (
          <div className="absolute top-2 right-2 flex items-center gap-1 bg-black/70 rounded-md px-1.5 py-0.5">
            <Star size={12} className="text-warning fill-warning" />
            <span className="text-[11px] font-semibold text-text">
              {item.rating.toFixed(1)}
            </span>
          </div>
        )}

        {/* Hover overlay (desktop) */}
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-3">
          <p className="text-sm font-medium text-text line-clamp-2">{item.title}</p>
        </div>
      </div>

      <p className="mt-2 text-xs sm:text-sm text-text-muted line-clamp-1 group-hover:text-text transition-colors">
        {item.title}
      </p>
    </Link>
  )
}
