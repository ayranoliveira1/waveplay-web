import { api } from './api'

// --- Types ---

export interface SaveProgressBody {
  tmdbId: number
  type: 'movie' | 'series'
  season?: number
  episode?: number
  progressSeconds: number
  durationSeconds: number
}

export interface AddHistoryBody {
  tmdbId: number
  type: 'movie' | 'series'
  title: string
  posterPath?: string | null
  season?: number
  episode?: number
  progressSeconds?: number
  durationSeconds?: number
}

export interface HistoryApiItem {
  id: string
  tmdbId: number
  type: 'movie' | 'series'
  title: string
  posterPath: string | null
  progressSeconds: number
  durationSeconds: number
  season?: number
  episode?: number
  watchedAt: string
}

interface HistoryList {
  items: HistoryApiItem[]
  page: number
  totalPages: number
}

// --- Helpers ---

function withPage(path: string, page?: number) {
  return page ? `${path}?page=${page}` : path
}

// --- Service ---

export const playback = {
  saveProgress: (profileId: string, body: SaveProgressBody) =>
    api.put<null>(`/progress/${profileId}`, body),

  getHistory: (profileId: string, page?: number) =>
    api.get<HistoryList>(withPage(`/history/${profileId}`, page)),

  addToHistory: (profileId: string, body: AddHistoryBody) =>
    api.post<null>(`/history/${profileId}`, body),

  clearHistory: (profileId: string) =>
    api.delete<null>(`/history/${profileId}`),
}
