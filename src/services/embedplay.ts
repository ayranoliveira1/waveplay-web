import { EMBED_PLAY_BASE_URL } from '../constants/api'

export function getPlayerUrl(
  tmdbId: number,
  type: 'movie' | 'series',
  season?: number,
  episode?: number,
): string {
  if (type === 'movie') return `${EMBED_PLAY_BASE_URL}/embed/${tmdbId}`
  return `${EMBED_PLAY_BASE_URL}/embed/${tmdbId}/${season}/${episode}`
}
