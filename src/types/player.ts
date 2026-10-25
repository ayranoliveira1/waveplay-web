// Espelha o EmbedSource do waveplay-api (GET /catalog/.../sources).
export interface PlayerSource {
  audio: 'dublado' | 'legendado'
  server: string
  label: string
  url: string
  sandbox: boolean
  reportsTime: boolean
}

export interface SourceChoice {
  audio: PlayerSource['audio']
  server: string
}

export type VidsrcMessage =
  | {
      kind: 'time'
      status: string
      progress: number
      duration: number
      tmdb: string
      season: number | null
      episode: number | null
    }
  | { kind: 'ui'; visible: boolean }

export interface EpisodeRef {
  season: number
  episode: number
}
