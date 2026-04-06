import { api } from './api'

interface ToggleBody {
  tmdbId: number
  type: 'movie' | 'series'
  title: string
  posterPath: string | null
  backdropPath: string | null
  rating: number
}

interface ToggleResult {
  added: boolean
}

interface LibraryItem {
  id: string
  tmdbId: number
  type: 'movie' | 'series'
  title: string
  posterPath: string | null
  backdropPath: string | null
  rating: number
  createdAt: string
}

interface LibraryList {
  page: number
  totalPages: number
}

interface FavoritesList extends LibraryList {
  favorites: LibraryItem[]
}

interface WatchlistList extends LibraryList {
  items: LibraryItem[]
}

function withPage(path: string, page?: number) {
  return page ? `${path}?page=${page}` : path
}

export const library = {
  // Favorites
  getFavorites: (profileId: string, page?: number) =>
    api.get<FavoritesList>(withPage(`/favorites/${profileId}`, page)),

  toggleFavorite: (profileId: string, body: ToggleBody) =>
    api.post<ToggleResult>(`/favorites/${profileId}`, body),

  // Watchlist
  getWatchlist: (profileId: string, page?: number) =>
    api.get<WatchlistList>(withPage(`/watchlist/${profileId}`, page)),

  toggleWatchlist: (profileId: string, body: ToggleBody) =>
    api.post<ToggleResult>(`/watchlist/${profileId}`, body),
}

export type { ToggleBody }
