import type { CatalogEpisode, CatalogSeason } from '../../types/api'
import type { EpisodeRef } from '../../types/player'

// Próximo = o seguinte da temporada ou o E1 da temporada seguinte, só se já lançado.
export function nextEpisodeOf(
  current: EpisodeRef,
  seasonEpisodes: CatalogEpisode[],
  seasons: CatalogSeason[],
  today: string,
): EpisodeRef | null {
  const aired = (airDate: string | null) => airDate === null || airDate <= today

  const next = seasonEpisodes.find((e) => e.episodeNumber > current.episode)
  if (next && aired(next.airDate)) return { season: current.season, episode: next.episodeNumber }

  const nextSeason = seasons
    .filter((s) => s.seasonNumber > current.season && s.episodeCount > 0 && aired(s.airDate))
    .sort((a, b) => a.seasonNumber - b.seasonNumber)[0]
  return nextSeason ? { season: nextSeason.seasonNumber, episode: 1 } : null
}

// O card do próximo episódio aparece 40 s antes do fim ou quando o player avisa que terminou.
export function nextCardDue(progress: number, duration: number | null, status?: string): boolean {
  return status === 'ended' || (duration !== null && duration > 0 && progress >= duration - 40)
}
