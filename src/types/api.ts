export interface Profile {
  id: string
  name: string
  avatarUrl: string | null
  isKid: boolean
  createdAt: string
}

export interface CatalogItem {
  id: number
  title: string
  posterPath: string | null
  backdropPath: string | null
  rating: number
  type: 'movie' | 'series'
  releaseDate: string
  overview?: string
}

export interface CatalogList {
  results: CatalogItem[]
  page: number
  totalPages: number
}

export interface CatalogMovieDetail {
  id: number
  title: string
  overview: string
  posterPath: string | null
  backdropPath: string | null
  rating: number
  runtime: number
  releaseDate: string
  genres: { id: number; name: string }[]
  tagline: string
  status: string
}

export interface CatalogSeriesDetail {
  id: number
  name: string
  overview: string
  posterPath: string | null
  backdropPath: string | null
  rating: number
  firstAirDate: string
  genres: { id: number; name: string }[]
  tagline: string
  status: string
  numberOfSeasons: number
  numberOfEpisodes: number
  seasons: CatalogSeason[]
}

export interface CatalogSeason {
  id: number
  seasonNumber: number
  name: string
  episodeCount: number
  posterPath: string | null
  airDate: string | null
}

export interface CatalogEpisode {
  id: number
  name: string
  overview: string
  episodeNumber: number
  seasonNumber: number
  stillPath: string | null
  airDate: string | null
  runtime: number | null
  voteAverage: number
}

export interface ActiveStreamInfo {
  streamId: string
  profileName: string
  title: string
  type: 'movie' | 'series'
  startedAt: string
}

export interface StreamConflictError {
  statusCode: 409
  code: 'MAX_STREAMS_REACHED'
  message: string
  maxStreams: number
  activeStreams: ActiveStreamInfo[]
}

export interface Plan {
  id: string
  name: string
  slug: string
  priceCents: number
  maxProfiles: number
  maxStreams: number
  description: string
}
