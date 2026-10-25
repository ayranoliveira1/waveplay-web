import { describe, expect, it } from 'vitest'
import { nextCardDue, nextEpisodeOf } from './next-episode'
import type { CatalogEpisode, CatalogSeason } from '../../types/api'

const today = '2026-10-24'

function episode(episodeNumber: number, airDate: string | null = '2026-01-01'): CatalogEpisode {
  return {
    id: 200 + episodeNumber,
    name: `Episódio ${episodeNumber}`,
    overview: '',
    episodeNumber,
    seasonNumber: 2,
    stillPath: null,
    airDate,
    runtime: 58,
    voteAverage: 8,
  }
}

function season(
  seasonNumber: number,
  airDate: string | null = '2025-01-01',
  episodeCount = 5,
): CatalogSeason {
  return {
    id: 100 + seasonNumber,
    seasonNumber,
    name: `Temporada ${seasonNumber}`,
    episodeCount,
    posterPath: null,
    airDate,
  }
}

const seasonTwo = [1, 2, 3, 4, 5].map((n) => episode(n))

describe('nextEpisodeOf', () => {
  it('next in season', () => {
    expect(
      nextEpisodeOf({ season: 2, episode: 3 }, seasonTwo, [season(1), season(2)], today),
    ).toEqual({ season: 2, episode: 4 })
  })

  it('next season', () => {
    const seasons = [season(1), season(2), season(3, '2026-09-01')]

    expect(nextEpisodeOf({ season: 2, episode: 5 }, seasonTwo, seasons, today)).toEqual({
      season: 3,
      episode: 1,
    })
  })

  it('returns null on last aired episode', () => {
    expect(
      nextEpisodeOf({ season: 2, episode: 5 }, seasonTwo, [season(1), season(2)], today),
    ).toBeNull()
  })

  it('skips unaired next episode', () => {
    const episodes = [
      episode(1),
      episode(2),
      episode(3),
      episode(4, '2026-11-01'),
      episode(5, '2026-11-08'),
    ]

    expect(
      nextEpisodeOf({ season: 2, episode: 3 }, episodes, [season(1), season(2)], today),
    ).toBeNull()
  })

  it('skips unaired next season', () => {
    const seasons = [season(1), season(2), season(3, '2027-01-01')]

    expect(nextEpisodeOf({ season: 2, episode: 5 }, seasonTwo, seasons, today)).toBeNull()
  })

  it('ignores season 0', () => {
    const seasons = [season(2), season(1), season(0, '2024-01-01', 3)]

    expect(nextEpisodeOf({ season: 2, episode: 5 }, seasonTwo, seasons, today)).toBeNull()
  })

  it('does not jump to the next season over an unaired episode', () => {
    const episodes = [
      episode(1),
      episode(2),
      episode(3),
      episode(4, '2026-11-01'),
      episode(5, null),
    ]
    const seasons = [season(1), season(2), season(3, null)]

    expect(nextEpisodeOf({ season: 2, episode: 3 }, episodes, seasons, today)).toBeNull()
  })

  it('takes the lowest next episode number regardless of order', () => {
    const episodes = [episode(5), episode(3), episode(4), episode(1), episode(2)]

    expect(
      nextEpisodeOf({ season: 2, episode: 3 }, episodes, [season(1), season(2)], today),
    ).toEqual({ season: 2, episode: 4 })
  })

  it('next season is the lowest one with episodes, null airDate counting as aired', () => {
    expect(
      nextEpisodeOf(
        { season: 2, episode: 5 },
        seasonTwo,
        [season(2), season(4), season(3, null)],
        today,
      ),
    ).toEqual({ season: 3, episode: 1 })
    expect(
      nextEpisodeOf(
        { season: 2, episode: 5 },
        seasonTwo,
        [season(2), season(3, '2026-09-01', 0)],
        today,
      ),
    ).toBeNull()
  })
})

describe('nextCardDue', () => {
  it('fires 40 s before the end or when the player ends', () => {
    expect(nextCardDue(3440, 3480)).toBe(true)
    expect(nextCardDue(3439, 3480)).toBe(false)
    expect(nextCardDue(10, 3480, 'ended')).toBe(true)
    expect(nextCardDue(5000, null)).toBe(false)
  })
})
