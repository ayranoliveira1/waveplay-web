import { useParams, Link } from 'react-router'
import { useQuery } from '@tanstack/react-query'
import { Play, ArrowLeft, Calendar, Clock, Film } from 'lucide-react'
import { catalog } from '../services/catalog'
import { useSubscription } from '../hooks/useSubscription'
import { TMDB_IMAGE_SIZES } from '../constants/api'
import { RatingBadge } from '../components/RatingBadge'
import { SubscriptionBanner } from '../components/SubscriptionBanner'
import { Carousel } from '../components/Carousel'
import { MediaCard } from '../components/MediaCard'
import { Skeleton } from '../components/ui/Skeleton'

function formatRuntime(minutes: number) {
  if (minutes < 60) return `${minutes}min`
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return m > 0 ? `${h}h ${m}min` : `${h}h`
}

function getYear(date: string) {
  return date ? new Date(date).getFullYear() : null
}

export function MovieDetailPage() {
  const { id } = useParams<{ id: string }>()
  const movieId = Number(id)
  const { hasActiveSubscription, reason } = useSubscription()

  const { data: movie, isLoading } = useQuery({
    queryKey: ['catalog', 'movie', movieId],
    queryFn: async () => {
      const res = await catalog.getMovieDetail(movieId)
      return res.success ? res.data : null
    },
    enabled: !!movieId,
  })

  const { data: similar, isLoading: similarLoading } = useQuery({
    queryKey: ['catalog', 'movie', movieId, 'similar'],
    queryFn: async () => {
      const res = await catalog.getSimilarMovies(movieId)
      return res.success ? res.data : null
    },
    enabled: !!movieId,
  })

  const fullBleed = 'relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] w-[100vw]'

  if (isLoading) {
    return (
      <div className="py-4">
        <div className={`${fullBleed} aspect-[16/9] sm:aspect-[21/9]`}>
          <Skeleton className="h-full w-full rounded-none" />
        </div>
        <div className="mt-6 space-y-3">
          <Skeleton className="h-8 w-2/3 rounded" />
          <Skeleton className="h-5 w-1/3 rounded" />
          <Skeleton className="h-4 w-full rounded" />
          <Skeleton className="h-4 w-5/6 rounded" />
        </div>
      </div>
    )
  }

  if (!movie) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <Film size={48} className="text-text-muted mb-4" />
        <h2 className="text-lg font-semibold text-text mb-1">Filme não encontrado</h2>
        <Link to="/browse" className="text-sm text-primary hover:text-primary-light mt-2">
          Voltar ao início
        </Link>
      </div>
    )
  }

  const year = getYear(movie.releaseDate)

  return (
    <div className="pb-8">
      {/* Backdrop */}
      <div className={`${fullBleed} relative aspect-[16/9] sm:aspect-[21/9] overflow-hidden`}>
        {movie.backdropPath ? (
          <img
            src={`${TMDB_IMAGE_SIZES.backdrop.large}${movie.backdropPath}`}
            alt={movie.title}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="h-full w-full bg-surface" />
        )}

        {/* Gradients */}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-background/80 via-transparent to-transparent" />

        {/* Subscription banner */}
        {!hasActiveSubscription && <SubscriptionBanner reason={reason as 'no-plan' | 'expired'} />}

        {/* Back button */}
        <button
          onClick={() => window.history.back()}
          className="absolute top-4 left-4 sm:left-6 z-20 flex items-center gap-1.5 text-text/80 hover:text-text transition-colors cursor-pointer"
        >
          <ArrowLeft size={20} />
          <span className="text-sm hidden sm:inline">Voltar</span>
        </button>
      </div>

      {/* Content */}
      <div className="mt-6 sm:mt-8 flex flex-col md:flex-row gap-6 md:gap-8">
        {/* Poster (desktop) */}
        {movie.posterPath && (
          <div className="hidden md:block flex-shrink-0 w-56 lg:w-64">
            <img
              src={`${TMDB_IMAGE_SIZES.poster.large}${movie.posterPath}`}
              alt={movie.title}
              className="w-full rounded-lg shadow-lg"
            />
          </div>
        )}

        {/* Info */}
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-text mb-3">
            {movie.title}
          </h1>

          {/* Meta */}
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <RatingBadge rating={movie.rating} />
            {year && (
              <span className="flex items-center gap-1 text-sm text-text-muted">
                <Calendar size={14} />
                {year}
              </span>
            )}
            {movie.runtime > 0 && (
              <span className="flex items-center gap-1 text-sm text-text-muted">
                <Clock size={14} />
                {formatRuntime(movie.runtime)}
              </span>
            )}
          </div>

          {/* Genres */}
          {movie.genres.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {movie.genres.map((genre) => (
                <span
                  key={genre.id}
                  className="px-3 py-1 rounded-full bg-surface text-xs font-medium text-text-muted"
                >
                  {genre.name}
                </span>
              ))}
            </div>
          )}

          {/* Tagline */}
          {movie.tagline && (
            <p className="text-sm italic text-text-muted mb-3">&quot;{movie.tagline}&quot;</p>
          )}

          {/* Overview */}
          {movie.overview && (
            <p className="text-sm sm:text-base text-text-muted leading-relaxed mb-6">
              {movie.overview}
            </p>
          )}

          {/* Actions */}
          <div className="flex items-center gap-3">
            {hasActiveSubscription ? (
              <Link
                to={`/watch/movie/${movie.id}`}
                className="flex items-center gap-2 h-11 px-6 rounded-lg bg-primary font-semibold text-sm text-text transition-colors hover:bg-primary-light"
              >
                <Play size={18} className="fill-text" />
                Assistir
              </Link>
            ) : (
              <button
                disabled
                className="flex items-center gap-2 h-11 px-6 rounded-lg bg-primary/50 font-semibold text-sm text-text/50 cursor-not-allowed"
              >
                <Play size={18} className="fill-text/50" />
                Assistir
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Similar */}
      {(similarLoading || (similar && similar.results.length > 0)) && (
        <Carousel title="Similares" isLoading={similarLoading}>
          {similar?.results.map((item) => (
            <MediaCard key={`${item.type}-${item.id}`} item={item} />
          ))}
        </Carousel>
      )}
    </div>
  )
}
