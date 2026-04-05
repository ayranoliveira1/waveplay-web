import { api } from './api'
import type {
  CatalogList,
  CatalogMovieDetail,
  CatalogSeriesDetail,
  CatalogEpisode,
  Genre,
} from '../types/api'

function withPage(path: string, page?: number) {
  return page ? `${path}?page=${page}` : path
}

export const catalog = {
  // Trending
  getTrending: (page?: number) => api.get<CatalogList>(withPage('/catalog/trending', page)),

  // Movies
  getPopularMovies: (page?: number) =>
    api.get<CatalogList>(withPage('/catalog/movies/popular', page)),
  getTopRatedMovies: (page?: number) =>
    api.get<CatalogList>(withPage('/catalog/movies/top-rated', page)),
  getNowPlayingMovies: (page?: number) =>
    api.get<CatalogList>(withPage('/catalog/movies/now-playing', page)),
  getUpcomingMovies: (page?: number) =>
    api.get<CatalogList>(withPage('/catalog/movies/upcoming', page)),
  getMovieGenres: () => api.get<{ genres: Genre[] }>('/catalog/genres/movies'),
  getMoviesByGenre: (genreId: number, page?: number) =>
    api.get<CatalogList>(withPage(`/catalog/movies/genre/${genreId}`, page)),

  // Series
  getPopularSeries: (page?: number) =>
    api.get<CatalogList>(withPage('/catalog/series/popular', page)),
  getTopRatedSeries: (page?: number) =>
    api.get<CatalogList>(withPage('/catalog/series/top-rated', page)),
  getAiringTodaySeries: (page?: number) =>
    api.get<CatalogList>(withPage('/catalog/series/airing-today', page)),
  getOnTheAirSeries: (page?: number) =>
    api.get<CatalogList>(withPage('/catalog/series/on-the-air', page)),
  getSeriesGenres: () => api.get<{ genres: Genre[] }>('/catalog/genres/series'),
  getSeriesByGenre: (genreId: number, page?: number) =>
    api.get<CatalogList>(withPage(`/catalog/series/genre/${genreId}`, page)),

  // Movie detail
  getMovieDetail: (id: number) =>
    api.get<CatalogMovieDetail>(`/catalog/movies/${id}`),
  getSimilarMovies: (id: number, page?: number) =>
    api.get<CatalogList>(withPage(`/catalog/movies/${id}/similar`, page)),

  // Series detail
  getSeriesDetail: (id: number) =>
    api.get<CatalogSeriesDetail>(`/catalog/series/${id}`),
  getSeasonDetail: (id: number, season: number) =>
    api.get<{ episodes: CatalogEpisode[] }>(`/catalog/series/${id}/seasons/${season}`),
  getSimilarSeries: (id: number, page?: number) =>
    api.get<CatalogList>(withPage(`/catalog/series/${id}/similar`, page)),

  // Search
  searchMulti: (query: string, page?: number) => {
    const params = new URLSearchParams({ q: query })
    if (page) params.set('page', String(page))
    return api.get<CatalogList>(`/catalog/search?${params.toString()}`)
  },
}
