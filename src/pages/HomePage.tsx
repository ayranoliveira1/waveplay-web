import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { catalog } from '../services/catalog'
import { useHistory, type HistoryItem } from '../hooks/useHistory'
import { HeroBanner } from '../components/HeroBanner'
import { Carousel } from '../components/Carousel'
import { MediaCard } from '../components/MediaCard'
import { ContinueWatchingCard } from '../components/ContinueWatchingCard'
import { WATCH_PROVIDERS } from '../constants/watch-providers'

export function HomePage() {
  const { history, isLoading: historyLoading } = useHistory()

  const continueWatching = useMemo(
    () =>
      history
        .map((h) => {
          if (!h.progressSeconds || !h.durationSeconds) return null
          const percent = h.progressSeconds / h.durationSeconds

          if (percent < 0.9) return h

          // Série completada → mostrar próximo episódio
          if (h.type === 'series' && h.lastEpisode != null) {
            return {
              ...h,
              lastEpisode: h.lastEpisode + 1,
              progressSeconds: 0,
              durationSeconds: 0,
            }
          }

          return null // Filme completado
        })
        .filter((h): h is HistoryItem => h !== null),
    [history],
  )

  const trending = useQuery({
    queryKey: ['catalog', 'trending'],
    queryFn: async () => {
      const res = await catalog.getTrending()
      return res.success ? res.data : null
    },
  })

  const popularMovies = useQuery({
    queryKey: ['catalog', 'movies', 'popular'],
    queryFn: async () => {
      const res = await catalog.getPopularMovies()
      return res.success ? res.data : null
    },
  })

  const popularSeries = useQuery({
    queryKey: ['catalog', 'series', 'popular'],
    queryFn: async () => {
      const res = await catalog.getPopularSeries()
      return res.success ? res.data : null
    },
  })

  const nowPlayingMovies = useQuery({
    queryKey: ['catalog', 'movies', 'now-playing'],
    queryFn: async () => {
      const res = await catalog.getNowPlayingMovies()
      return res.success ? res.data : null
    },
  })

  const topRatedMovies = useQuery({
    queryKey: ['catalog', 'movies', 'top-rated'],
    queryFn: async () => {
      const res = await catalog.getTopRatedMovies()
      return res.success ? res.data : null
    },
  })

  const netflixCatalog = useQuery({
    queryKey: ['catalog', 'watch-provider', 'netflix'],
    queryFn: async () => {
      const res = await catalog.getByWatchProviders(8)
      return res.success ? res.data : null
    },
  })

  const disneyCatalog = useQuery({
    queryKey: ['catalog', 'watch-provider', 'disney-plus'],
    queryFn: async () => {
      const res = await catalog.getByWatchProviders(337)
      return res.success ? res.data : null
    },
  })

  const maxCatalog = useQuery({
    queryKey: ['catalog', 'watch-provider', 'max'],
    queryFn: async () => {
      const res = await catalog.getByWatchProviders(1899)
      return res.success ? res.data : null
    },
  })

  const primeCatalog = useQuery({
    queryKey: ['catalog', 'watch-provider', 'prime-video'],
    queryFn: async () => {
      const res = await catalog.getByWatchProviders(119)
      return res.success ? res.data : null
    },
  })

  const watchProviderQueries = {
    netflix: netflixCatalog,
    'disney-plus': disneyCatalog,
    max: maxCatalog,
    'prime-video': primeCatalog,
  } as const

  const heroItems = trending.data?.results.slice(0, 5) ?? []

  return (
    <div>
      <HeroBanner items={heroItems} isLoading={trending.isLoading} />

      <div className="mt-6 sm:mt-8">
        {(historyLoading || continueWatching.length > 0) && (
          <Carousel title="Continue Assistindo" isLoading={historyLoading}>
            {continueWatching.slice(0, 10).map((item) => (
              <ContinueWatchingCard
                key={`continue-${item.id}-${item.type}-${item.lastSeason ?? 0}-${item.lastEpisode ?? 0}`}
                item={item}
              />
            ))}
          </Carousel>
        )}

        <Carousel title="Em alta" isLoading={trending.isLoading}>
          {trending.data?.results.map((item) => (
            <MediaCard key={`${item.type}-${item.id}`} item={item} />
          ))}
        </Carousel>

        <Carousel title="Filmes populares" isLoading={popularMovies.isLoading}>
          {popularMovies.data?.results.map((item) => (
            <MediaCard key={`movie-${item.id}`} item={item} />
          ))}
        </Carousel>

        <Carousel title="Séries populares" isLoading={popularSeries.isLoading}>
          {popularSeries.data?.results.map((item) => (
            <MediaCard key={`series-${item.id}`} item={item} />
          ))}
        </Carousel>

        <Carousel title="Em cartaz" isLoading={nowPlayingMovies.isLoading}>
          {nowPlayingMovies.data?.results.map((item) => (
            <MediaCard key={`now-playing-${item.id}`} item={item} />
          ))}
        </Carousel>

        <Carousel title="Mais bem avaliados" isLoading={topRatedMovies.isLoading}>
          {topRatedMovies.data?.results.map((item) => (
            <MediaCard key={`top-rated-${item.id}`} item={item} />
          ))}
        </Carousel>

        {WATCH_PROVIDERS.map((provider) => {
          const query = watchProviderQueries[provider.slug as keyof typeof watchProviderQueries]
          const items = query.data?.results ?? []
          if (!query.isLoading && items.length === 0) return null
          return (
            <Carousel key={provider.slug} title={provider.title} isLoading={query.isLoading}>
              {items.map((item) => (
                <MediaCard key={`${provider.slug}-${item.type}-${item.id}`} item={item} />
              ))}
            </Carousel>
          )
        })}
      </div>
    </div>
  )
}
