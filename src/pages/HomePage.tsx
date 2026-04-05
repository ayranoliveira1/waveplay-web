import { useQuery } from '@tanstack/react-query'
import { catalog } from '../services/catalog'
import { HeroBanner } from '../components/HeroBanner'
import { Carousel } from '../components/Carousel'
import { MediaCard } from '../components/MediaCard'

export function HomePage() {
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

  const heroItem = trending.data?.results[0]

  return (
    <div>
      <HeroBanner item={heroItem} isLoading={trending.isLoading} />

      <div className="mt-6 sm:mt-8">
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
