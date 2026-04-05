import { Link } from 'react-router'
import { Play, Info } from 'lucide-react'
import { TMDB_IMAGE_SIZES } from '../constants/api'
import { Skeleton } from './ui/Skeleton'
import type { CatalogItem } from '../types/api'

interface HeroBannerProps {
  item: CatalogItem | undefined
  isLoading?: boolean
}

export function HeroBanner({ item, isLoading = false }: HeroBannerProps) {
  const fullBleed = 'relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] w-[100vw]'

  if (isLoading || !item) {
    return (
      <div className={`${fullBleed} aspect-[16/9] sm:aspect-[21/9]`}>
        <Skeleton className="h-full w-full rounded-none" />
      </div>
    )
  }

  const detailPath =
    item.type === 'movie' ? `/browse/movie/${item.id}` : `/browse/series/${item.id}`
  const watchPath = `/watch/${item.type}/${item.id}`

  return (
    <div className={`${fullBleed} aspect-[16/9] sm:aspect-[21/9] overflow-hidden`}>
      {/* Backdrop image */}
      {item.backdropPath ? (
        <img
          src={`${TMDB_IMAGE_SIZES.backdrop.large}${item.backdropPath}`}
          alt={item.title}
          className="absolute inset-0 h-full w-full object-cover"
        />
      ) : (
        <div className="absolute inset-0 bg-surface" />
      )}

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-r from-background/80 via-transparent to-transparent" />

      {/* Content */}
      <div className="absolute inset-0 flex items-end px-4 sm:px-6 md:px-8 lg:px-12 pb-8 sm:pb-12 md:pb-16">
        <div className="max-w-2xl">
          <h1 className="text-xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-text mb-2 sm:mb-3 line-clamp-2">
            {item.title}
          </h1>

          {item.overview && (
            <p className="text-xs sm:text-sm md:text-base text-text-muted mb-4 sm:mb-6 line-clamp-2 sm:line-clamp-3">
              {item.overview}
            </p>
          )}

          <div className="flex gap-3">
            <Link
              to={watchPath}
              className="flex items-center gap-2 h-9 sm:h-11 px-4 sm:px-6 rounded-lg bg-primary font-semibold text-xs sm:text-sm text-text transition-colors hover:bg-primary-light"
            >
              <Play size={16} className="fill-text" />
              Assistir
            </Link>
            <Link
              to={detailPath}
              className="flex items-center gap-2 h-9 sm:h-11 px-4 sm:px-6 rounded-lg bg-surface/80 font-semibold text-xs sm:text-sm text-text transition-colors hover:bg-surface"
            >
              <Info size={16} />
              Mais info
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
