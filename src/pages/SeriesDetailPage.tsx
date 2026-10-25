import { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router'
import { useQuery } from '@tanstack/react-query'
import { Play, ArrowLeft, Calendar, Tv, Film, Heart, Bookmark } from 'lucide-react'
import { catalog } from '../services/catalog'
import { useSubscription } from '../hooks/useSubscription'
import { useFavorite } from '../hooks/useFavorite'
import { useWatchlist } from '../hooks/useWatchlist'
import { useProgress, formatTime } from '../hooks/useProgress'
import { TMDB_IMAGE_SIZES } from '../constants/api'
import { RatingBadge } from '../components/RatingBadge'
import { SubscriptionBanner } from '../components/SubscriptionBanner'
import { SeasonPicker } from '../components/SeasonPicker'
import { EpisodeCard } from '../components/EpisodeCard'
import { Carousel } from '../components/Carousel'
import { MediaCard } from '../components/MediaCard'
import { Skeleton } from '../components/ui/Skeleton'

function getYear(date: string) {
  return date ? new Date(date).getFullYear() : null
}

export function SeriesDetailPage() {
  const { id } = useParams<{ id: string }>()
  const seriesId = Number(id)
  const navigate = useNavigate()
  const { hasActiveSubscription, reason } = useSubscription()

  const { isFavorite, toggleFavorite } = useFavorite(seriesId, 'series')
  const { isInWatchlist, toggleWatchlist } = useWatchlist(seriesId, 'series')

  const [userSelectedSeason, setUserSelectedSeason] = useState<number | null>(null)

  const { data: series, isLoading } = useQuery({
    queryKey: ['catalog', 'series', seriesId],
    queryFn: async () => {
      const res = await catalog.getSeriesDetail(seriesId)
      return res.success ? res.data.series : null
    },
    enabled: !!seriesId,
  })

  // Progress — must be before defaultSeason to derive lastSeason
  const { getAllProgressForSeries } = useProgress()
  const seriesProgress = getAllProgressForSeries(seriesId)

  const lastWatchedKey = Object.keys(seriesProgress).sort(
    (a, b) =>
      new Date(seriesProgress[b]!.updatedAt).getTime() -
      new Date(seriesProgress[a]!.updatedAt).getTime(),
  )[0]
  const lastWatchedMatch = lastWatchedKey?.match(/series-\d+-(\d+)-(\d+)/)
  const lastSeason = lastWatchedMatch ? Number(lastWatchedMatch[1]) : null
  const lastEpisode = lastWatchedMatch ? Number(lastWatchedMatch[2]) : null
  const lastProgress = lastWatchedKey ? seriesProgress[lastWatchedKey] : null
  const lastPercent =
    lastProgress && lastProgress.durationSeconds > 0
      ? lastProgress.progressSeconds / lastProgress.durationSeconds
      : 0
  const canContinue = lastProgress && lastPercent > 0 && lastPercent < 0.9

  const defaultSeason =
    lastSeason ?? series?.seasons.find((s) => s.seasonNumber > 0)?.seasonNumber ?? null
  const selectedSeason = userSelectedSeason ?? defaultSeason

  const { data: episodes, isLoading: episodesLoading } = useQuery({
    queryKey: ['catalog', 'series', seriesId, 'season', selectedSeason],
    queryFn: async () => {
      const res = await catalog.getSeasonDetail(seriesId, selectedSeason!)
      return res.success ? res.data.episodes : []
    },
    enabled: !!seriesId && selectedSeason !== null,
  })

  const { data: similar, isLoading: similarLoading } = useQuery({
    queryKey: ['catalog', 'series', seriesId, 'similar'],
    queryFn: async () => {
      const res = await catalog.getSimilarSeries(seriesId)
      return res.success ? res.data : null
    },
    enabled: !!seriesId,
  })

  function handlePlay(season?: number, episode?: number) {
    if (!series) return

    const targetSeason = season ?? episodes?.[0]?.seasonNumber
    const targetEpisode = episode ?? episodes?.[0]?.episodeNumber
    if (targetSeason === undefined || targetEpisode === undefined) return

    navigate(`/watch/series/${series.id}/${targetSeason}/${targetEpisode}`)
  }

  const fullBleed = 'relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] w-[100vw]'
  const firstEpisode = episodes?.[0]

  if (isLoading) {
    return (
      <div className="py-4">
        <div className={`${fullBleed} aspect-video sm:aspect-21/9`}>
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

  if (!series) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <Tv size={48} className="text-text-muted mb-4" />
        <h2 className="text-lg font-semibold text-text mb-1">Série não encontrada</h2>
        <Link to="/browse" className="text-sm text-primary hover:text-primary-light mt-2">
          Voltar ao início
        </Link>
      </div>
    )
  }

  const year = getYear(series.firstAirDate)

  return (
    <div className="pb-8">
      {/* Backdrop */}
      <div className={`${fullBleed} relative aspect-video sm:aspect-21/9 overflow-hidden`}>
        {series.backdropPath ? (
          <img
            src={`${TMDB_IMAGE_SIZES.backdrop.large}${series.backdropPath}`}
            alt={series.name}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="h-full w-full bg-surface" />
        )}

        {/* Gradients */}
        <div className="absolute inset-0 bg-linear-to-t from-background via-background/60 to-transparent" />
        <div className="absolute inset-0 bg-linear-to-r from-background/80 via-transparent to-transparent" />

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
        {series.posterPath && (
          <div className="hidden md:block shrink-0 w-56 lg:w-64">
            <img
              src={`${TMDB_IMAGE_SIZES.poster.large}${series.posterPath}`}
              alt={series.name}
              className="w-full rounded-lg shadow-lg"
            />
          </div>
        )}

        {/* Info */}
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-text mb-3">
            {series.name}
          </h1>

          {/* Meta */}
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <RatingBadge rating={series.rating} />
            {year && (
              <span className="flex items-center gap-1 text-sm text-text-muted">
                <Calendar size={14} />
                {year}
              </span>
            )}
            <span className="text-sm text-text-muted">
              {series.numberOfSeasons} temporada{series.numberOfSeasons !== 1 ? 's' : ''}
            </span>
          </div>

          {/* Genres */}
          {series.genres?.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {series.genres.map((genre) => (
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
          {series.tagline && (
            <p className="text-sm italic text-text-muted mb-3">&quot;{series.tagline}&quot;</p>
          )}

          {/* Overview */}
          {series.overview && (
            <p className="text-sm sm:text-base text-text-muted leading-relaxed mb-6">
              {series.overview}
            </p>
          )}

          {/* Actions */}
          <div className="flex items-center gap-3">
            {hasActiveSubscription && firstEpisode ? (
              <button
                onClick={() =>
                  canContinue && lastSeason && lastEpisode
                    ? handlePlay(lastSeason, lastEpisode)
                    : handlePlay()
                }
                className={`flex items-center gap-2 h-11 ${canContinue ? 'px-8' : 'px-14'} rounded-lg bg-primary font-semibold text-sm text-text transition-colors hover:bg-primary-light cursor-pointer`}
              >
                <Play size={18} className="fill-text" />
                {canContinue && lastSeason && lastEpisode
                  ? `Continuar T${lastSeason} E${lastEpisode} - ${formatTime(lastProgress!.progressSeconds)}`
                  : 'Assistir'}
              </button>
            ) : (
              <button
                disabled
                className="flex items-center gap-2 h-11 px-14 rounded-lg bg-primary/50 font-semibold text-sm text-text/50 cursor-not-allowed"
              >
                <Play size={18} className="fill-text/50" />
                Assistir
              </button>
            )}

            <button
              onClick={() =>
                toggleFavorite({
                  tmdbId: series.id,
                  type: 'series',
                  title: series.name,
                  posterPath: series.posterPath,
                  backdropPath: series.backdropPath,
                  rating: series.rating,
                })
              }
              className="flex items-center justify-center w-11 h-11 rounded-full bg-surface transition-colors hover:bg-surface/80 cursor-pointer"
              title={isFavorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
            >
              <Heart
                size={20}
                className={isFavorite ? 'fill-red-500 text-red-500' : 'text-text-muted'}
              />
            </button>

            <button
              onClick={() =>
                toggleWatchlist({
                  tmdbId: series.id,
                  type: 'series',
                  title: series.name,
                  posterPath: series.posterPath,
                  backdropPath: series.backdropPath,
                  rating: series.rating,
                })
              }
              className="flex items-center justify-center w-11 h-11 rounded-full bg-surface transition-colors hover:bg-surface/80 cursor-pointer"
              title={isInWatchlist ? 'Remover da watchlist' : 'Assistir depois'}
            >
              <Bookmark
                size={20}
                className={isInWatchlist ? 'fill-primary text-primary' : 'text-text-muted'}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Season picker + Episodes */}
      {series.seasons.length > 0 && selectedSeason !== null && (
        <div className="mt-8">
          <div className="flex items-center gap-4 mb-4">
            <h2 className="text-base font-semibold text-text">Episódios</h2>
            <SeasonPicker
              seasons={series.seasons}
              selectedSeason={selectedSeason}
              onSelect={setUserSelectedSeason}
            />
          </div>

          {episodesLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex gap-3 sm:gap-4">
                  <Skeleton className="shrink-0 w-28 sm:w-36 md:w-52 lg:w-60 aspect-video rounded-lg" />
                  <div className="flex-1 space-y-2 py-1">
                    <Skeleton className="h-4 w-1/2 rounded" />
                    <Skeleton className="h-3 w-1/4 rounded" />
                    <Skeleton className="h-3 w-full rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : episodes && episodes.length > 0 ? (
            <div className="space-y-2">
              {episodes.map((episode) => {
                const key = `series-${seriesId}-${episode.seasonNumber}-${episode.episodeNumber}`
                const prog = seriesProgress[key]
                const percent =
                  prog && prog.durationSeconds > 0
                    ? prog.progressSeconds / prog.durationSeconds
                    : undefined
                return (
                  <EpisodeCard
                    key={episode.id}
                    episode={episode}
                    seriesId={series.id}
                    disabled={!hasActiveSubscription}
                    progressPercent={percent}
                    onPlay={handlePlay}
                  />
                )
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center py-8 text-center">
              <Film size={32} className="text-text-muted mb-2" />
              <p className="text-sm text-text-muted">Nenhum episódio disponível</p>
            </div>
          )}
        </div>
      )}

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
