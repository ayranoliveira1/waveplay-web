import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { catalog } from '../services/catalog'
import { GenreChips } from '../components/GenreChips'
import { Carousel } from '../components/Carousel'
import { MediaCard } from '../components/MediaCard'
import { Skeleton } from '../components/ui/Skeleton'

export function MoviesPage() {
  const [selectedGenre, setSelectedGenre] = useState<number | null>(null)
  const [genrePage, setGenrePage] = useState(1)

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

  const genreResults = useQuery({
    queryKey: ['catalog', 'movies', 'genre', selectedGenre, genrePage],
    queryFn: async () => {
      const res = await catalog.getMoviesByGenre(selectedGenre!, genrePage)
      return res.success ? res.data : null
    },
    enabled: selectedGenre !== null,
  })

  function handleGenreSelect(id: number | null) {
    setSelectedGenre(id)
    setGenrePage(1)
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
                {genreResults.data?.results.map((item) => (
                  <MediaCard key={`movie-${item.id}`} item={item} size="lg" />
                ))}
              </div>

              {genreResults.data && genreResults.data.totalPages > 1 && (
                <div className="flex items-center justify-center gap-4 mt-8">
                  <button
                    onClick={() => setGenrePage((p) => Math.max(1, p - 1))}
                    disabled={genrePage <= 1}
                    className="px-4 py-2 rounded-lg bg-surface text-sm font-medium text-text disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer hover:bg-border transition-colors"
                  >
                    Anterior
                  </button>
                  <span className="text-sm text-text-muted">
                    {genrePage} / {genreResults.data.totalPages}
                  </span>
                  <button
                    onClick={() => setGenrePage((p) => p + 1)}
                    disabled={genrePage >= genreResults.data.totalPages}
                    className="px-4 py-2 rounded-lg bg-surface text-sm font-medium text-text disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer hover:bg-border transition-colors"
                  >
                    Próxima
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  )
}
