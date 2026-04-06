import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { catalog } from '../services/catalog'
import { useHistory } from '../hooks/useHistory'
import { HeroBanner } from '../components/HeroBanner'
import { Carousel } from '../components/Carousel'
import { MediaCard } from '../components/MediaCard'
import { ContinueWatchingCard } from '../components/ContinueWatchingCard'

export function HomePage() {
  const { history, isLoading: historyLoading } = useHistory()

  const continueWatching = useMemo(
    () =>
      history.filter(
        (h) =>
          h.progressSeconds &&
          h.durationSeconds &&
          h.progressSeconds / h.durationSeconds < 0.9,
      ),
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
      </div>
    </div>
  )
}
