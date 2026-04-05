import { useState, useRef, useEffect } from 'react'
import { useQuery, useInfiniteQuery } from '@tanstack/react-query'
import { catalog } from '../services/catalog'
import { GenreChips } from '../components/GenreChips'
import { Carousel } from '../components/Carousel'
import { MediaCard } from '../components/MediaCard'
import { Skeleton } from '../components/ui/Skeleton'
import { Loader2 } from 'lucide-react'

export function SeriesPage() {
  const [selectedGenre, setSelectedGenre] = useState<number | null>(null)

  const genres = useQuery({
    queryKey: ['catalog', 'genres', 'series'],
    queryFn: async () => {
      const res = await catalog.getSeriesGenres()
      return res.success ? res.data.genres : []
    },
  })

  const popular = useQuery({
    queryKey: ['catalog', 'series', 'popular'],
    queryFn: async () => {
      const res = await catalog.getPopularSeries()
      return res.success ? res.data : null
    },
    enabled: selectedGenre === null,
  })

  const topRated = useQuery({
    queryKey: ['catalog', 'series', 'top-rated'],
    queryFn: async () => {
      const res = await catalog.getTopRatedSeries()
      return res.success ? res.data : null
    },
    enabled: selectedGenre === null,
  })

  const airingToday = useQuery({
    queryKey: ['catalog', 'series', 'airing-today'],
    queryFn: async () => {
      const res = await catalog.getAiringTodaySeries()
      return res.success ? res.data : null
    },
    enabled: selectedGenre === null,
  })

  const onTheAir = useQuery({
    queryKey: ['catalog', 'series', 'on-the-air'],
    queryFn: async () => {
      const res = await catalog.getOnTheAirSeries()
      return res.success ? res.data : null
    },
    enabled: selectedGenre === null,
  })

  const genreResults = useInfiniteQuery({
    queryKey: ['catalog', 'series', 'genre', selectedGenre],
    queryFn: async ({ pageParam }) => {
      const res = await catalog.getSeriesByGenre(selectedGenre!, pageParam)
      return res.success ? res.data : { results: [], page: pageParam, totalPages: 0 }
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.page < lastPage.totalPages ? lastPage.page + 1 : undefined,
    enabled: selectedGenre !== null,
  })

  const allResults = genreResults.data?.pages.flatMap((p) => p.results) ?? []

  // Infinite scroll sentinel
  const sentinelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (selectedGenre === null) return
    const el = sentinelRef.current
    if (!el) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          genreResults.fetchNextPage()
        }
      },
      { rootMargin: '400px' },
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [selectedGenre, genreResults])

  function handleGenreSelect(id: number | null) {
    setSelectedGenre(id)
  }

  return (
    <div className="py-4 sm:py-6">
      <h1 className="text-2xl sm:text-3xl font-bold text-text mb-4 sm:mb-6">Séries</h1>

      <GenreChips
        genres={genres.data ?? []}
        selectedId={selectedGenre}
        onSelect={handleGenreSelect}
      />

      {selectedGenre === null ? (
        <div className="mt-4">
          <Carousel title="Populares" isLoading={popular.isLoading}>
            {popular.data?.results.map((item) => (
              <MediaCard key={`series-${item.id}`} item={item} />
            ))}
          </Carousel>

          <Carousel title="Mais votadas" isLoading={topRated.isLoading}>
            {topRated.data?.results.map((item) => (
              <MediaCard key={`series-${item.id}`} item={item} />
            ))}
          </Carousel>

          <Carousel title="No ar hoje" isLoading={airingToday.isLoading}>
            {airingToday.data?.results.map((item) => (
              <MediaCard key={`series-${item.id}`} item={item} />
            ))}
          </Carousel>

          <Carousel title="Em exibição" isLoading={onTheAir.isLoading}>
            {onTheAir.data?.results.map((item) => (
              <MediaCard key={`series-${item.id}`} item={item} />
            ))}
          </Carousel>
        </div>
      ) : (
        <div className="mt-6">
          {genreResults.isLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
              {Array.from({ length: 18 }).map((_, i) => (
                <div key={i}>
                  <Skeleton className="aspect-[2/3] rounded-lg" />
                  <Skeleton className="h-4 mt-2 w-3/4 rounded" />
                </div>
              ))}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
                {allResults.map((item) => (
                  <MediaCard key={`series-${item.id}`} item={item} size="lg" />
                ))}
              </div>

              {/* Sentinel + loading */}
              <div ref={sentinelRef} className="flex justify-center py-8">
                {genreResults.isFetchingNextPage && (
                  <Loader2 size={24} className="text-primary animate-spin" />
                )}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}
