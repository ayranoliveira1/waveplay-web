import { useState, useRef, useEffect } from 'react'
import { useQuery, useInfiniteQuery } from '@tanstack/react-query'
import { catalog } from '../services/catalog'
import { GenreChips } from '../components/GenreChips'
import { Carousel } from '../components/Carousel'
import { MediaCard } from '../components/MediaCard'
import { Skeleton } from '../components/ui/Skeleton'
import { Loader2 } from 'lucide-react'

export function MoviesPage() {
  const [selectedGenre, setSelectedGenre] = useState<number | null>(null)

  const genres = useQuery({
    queryKey: ['catalog', 'genres', 'movies'],
    queryFn: async () => {
      const res = await catalog.getMovieGenres()
      return res.success ? res.data.genres : []
    },
  })

  const popular = useQuery({
    queryKey: ['catalog', 'movies', 'popular'],
    queryFn: async () => {
      const res = await catalog.getPopularMovies()
      return res.success ? res.data : null
    },
    enabled: selectedGenre === null,
  })

  const topRated = useQuery({
    queryKey: ['catalog', 'movies', 'top-rated'],
    queryFn: async () => {
      const res = await catalog.getTopRatedMovies()
      return res.success ? res.data : null
    },
    enabled: selectedGenre === null,
  })

  const nowPlaying = useQuery({
    queryKey: ['catalog', 'movies', 'now-playing'],
    queryFn: async () => {
      const res = await catalog.getNowPlayingMovies()
      return res.success ? res.data : null
    },
    enabled: selectedGenre === null,
  })

  const upcoming = useQuery({
    queryKey: ['catalog', 'movies', 'upcoming'],
    queryFn: async () => {
      const res = await catalog.getUpcomingMovies()
      return res.success ? res.data : null
    },
    enabled: selectedGenre === null,
  })

  const genreResults = useInfiniteQuery({
    queryKey: ['catalog', 'movies', 'genre', selectedGenre],
    queryFn: async ({ pageParam }) => {
      const res = await catalog.getMoviesByGenre(selectedGenre!, pageParam)
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
      <h1 className="text-2xl sm:text-3xl font-bold text-text mb-4 sm:mb-6">Filmes</h1>

      <GenreChips
        genres={genres.data ?? []}
        selectedId={selectedGenre}
        onSelect={handleGenreSelect}
      />

      {selectedGenre === null ? (
        <div className="mt-4">
          <Carousel title="Populares" isLoading={popular.isLoading}>
            {popular.data?.results.map((item) => (
              <MediaCard key={`movie-${item.id}`} item={item} />
            ))}
          </Carousel>

          <Carousel title="Mais votados" isLoading={topRated.isLoading}>
            {topRated.data?.results.map((item) => (
              <MediaCard key={`movie-${item.id}`} item={item} />
            ))}
          </Carousel>

          <Carousel title="Em cartaz" isLoading={nowPlaying.isLoading}>
            {nowPlaying.data?.results.map((item) => (
              <MediaCard key={`movie-${item.id}`} item={item} />
            ))}
          </Carousel>

          <Carousel title="Em breve" isLoading={upcoming.isLoading}>
            {upcoming.data?.results.map((item) => (
              <MediaCard key={`movie-${item.id}`} item={item} />
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
                  <MediaCard key={`movie-${item.id}`} item={item} size="lg" />
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
