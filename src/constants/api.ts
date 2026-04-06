export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

export const TMDB_IMAGE_BASE = import.meta.env.VITE_TMDB_IMAGE_BASE

export const EMBED_PLAY_BASE_URL = import.meta.env.VITE_EMBED_PLAY_BASE_URL

export const TMDB_IMAGE_SIZES = {
  poster: {
    small: `${TMDB_IMAGE_BASE}/w185`,
    medium: `${TMDB_IMAGE_BASE}/w342`,
    large: `${TMDB_IMAGE_BASE}/w500`,
    original: `${TMDB_IMAGE_BASE}/original`,
  },
  backdrop: {
    small: `${TMDB_IMAGE_BASE}/w300`,
    medium: `${TMDB_IMAGE_BASE}/w780`,
    large: `${TMDB_IMAGE_BASE}/w1280`,
    original: `${TMDB_IMAGE_BASE}/original`,
  },
  still: {
    small: `${TMDB_IMAGE_BASE}/w185`,
    medium: `${TMDB_IMAGE_BASE}/w300`,
  },
} as const
