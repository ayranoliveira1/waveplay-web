import { api } from './api'
import type { PlayerSource } from '../types/player'

export const sources = {
  forMovie: (id: number) => api.get<{ sources: PlayerSource[] }>(`/catalog/movies/${id}/sources`),
  forEpisode: (id: number, season: number, episode: number) =>
    api.get<{ sources: PlayerSource[] }>(
      `/catalog/series/${id}/seasons/${season}/episodes/${episode}/sources`,
    ),
}
