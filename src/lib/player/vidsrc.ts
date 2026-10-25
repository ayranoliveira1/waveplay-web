import type { EpisodeRef, VidsrcMessage } from '../../types/player'

type JsonObject = Record<string, unknown>

function asObject(value: unknown): JsonObject | null {
  return typeof value === 'object' && value !== null ? (value as JsonObject) : null
}

function finiteOrNull(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null
}

function intOrNull(value: unknown): number | null {
  return finiteOrNull(typeof value === 'string' ? Number.parseInt(value, 10) : value)
}

export function parseVidsrcMessage(data: unknown): VidsrcMessage | null {
  let parsed = data
  if (typeof data === 'string') {
    try {
      parsed = JSON.parse(data)
    } catch {
      return null
    }
  }

  const message = asObject(parsed)
  if (message?.type === 'PLAYER_UI') {
    return typeof message.visible === 'boolean' ? { kind: 'ui', visible: message.visible } : null
  }
  if (message?.type !== 'PLAYER_EVENT') return null

  const event = asObject(message.data)
  const info = asObject(event?.player_info)
  const progress = finiteOrNull(event?.player_progress)
  const duration = finiteOrNull(event?.player_duration)
  if (!event || !info || progress === null || duration === null) return null

  return {
    kind: 'time',
    status: String(event.player_status ?? ''),
    progress,
    duration,
    tmdb: String(info.tmdb ?? ''),
    season: intOrNull(info.season),
    episode: intOrNull(info.episode),
  }
}

// O tempo só vale para o título/episódio aberto. O filme é aberto por imdb e chega com
// tmdb vazio: aí a origem e o iframe, conferidos por quem recebe, bastam.
export function isForCurrentTitle(
  msg: VidsrcMessage,
  tmdbId: number,
  episode: EpisodeRef | null,
): boolean {
  if (msg.kind !== 'time') return true
  if (msg.tmdb !== '' && msg.tmdb !== String(tmdbId)) return false
  return !episode || (msg.season === episode.season && msg.episode === episode.episode)
}

// Retomar só faz sentido entre 30 s e 95% da duração; fora disso o vídeo começa do início.
export function withStartAt(url: string, seconds: number, duration: number | null): string {
  const startAt = Math.floor(seconds)
  if (!(startAt >= 30) || (duration && startAt > duration * 0.95)) return url
  return `${url}${url.includes('?') ? '&' : '?'}startAt=${startAt}`
}
