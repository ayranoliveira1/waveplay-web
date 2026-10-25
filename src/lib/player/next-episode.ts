import type { CatalogEpisode, CatalogSeason } from '../../types/api'
import type { EpisodeRef } from '../../types/player'

export function isAired(airDate: string | null, today: string): boolean {
  return airDate === null || airDate <= today
}

// Próximo = o seguinte da temporada ou o E1 da temporada seguinte, só se já lançado.
// Se o seguinte da temporada existe mas ainda não saiu, não há próximo: nunca pula episódios.
export function nextEpisodeOf(
  current: EpisodeRef,
  seasonEpisodes: CatalogEpisode[],
  seasons: CatalogSeason[],
  today: string,
): EpisodeRef | null {
  const next = seasonEpisodes
    .filter((e) => e.episodeNumber > current.episode)
    .sort((a, b) => a.episodeNumber - b.episodeNumber)[0]
  if (next) {
    return isAired(next.airDate, today)
      ? { season: current.season, episode: next.episodeNumber }
      : null
  }

  const nextSeason = seasons
    .filter(
      (s) => s.seasonNumber > current.season && s.episodeCount > 0 && isAired(s.airDate, today),
    )
    .sort((a, b) => a.seasonNumber - b.seasonNumber)[0]
  return nextSeason ? { season: nextSeason.seasonNumber, episode: 1 } : null
}

// O card do próximo episódio aparece 40 s antes do fim ou quando o player avisa que terminou.
export function nextCardDue(progress: number, duration: number | null, status?: string): boolean {
  return status === 'ended' || (duration !== null && duration > 0 && progress >= duration - 40)
}
