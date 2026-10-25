import { describe, expect, it } from 'vitest'
import { parseVidsrcMessage, withStartAt } from './vidsrc'

const playerEvent = {
  type: 'PLAYER_EVENT',
  data: {
    player_info: { tmdb: '1396', mediaType: 'tv', season: 1, episode: 1 },
    player_status: 'playing',
    player_progress: 10.1,
    player_duration: 3480,
  },
}

describe('parseVidsrcMessage', () => {
  it('parses PLAYER_EVENT', () => {
    const expected = {
      kind: 'time',
      status: 'playing',
      progress: 10.1,
      duration: 3480,
      tmdb: '1396',
      season: 1,
      episode: 1,
    }

    expect(parseVidsrcMessage(playerEvent)).toEqual(expected)
    expect(parseVidsrcMessage(JSON.stringify(playerEvent))).toEqual(expected)
  })

  it('parses PLAYER_UI', () => {
    expect(parseVidsrcMessage({ type: 'PLAYER_UI', visible: false })).toEqual({
      kind: 'ui',
      visible: false,
    })
  })

  it('rejects PLAYER_UI without boolean visible', () => {
    expect(parseVidsrcMessage({ type: 'PLAYER_UI' })).toBeNull()
    expect(parseVidsrcMessage({ type: 'PLAYER_UI', visible: 'false' })).toBeNull()
  })

  it('accepts numeric strings for season and episode', () => {
    const stringEpisode = {
      ...playerEvent,
      data: {
        ...playerEvent.data,
        player_info: { ...playerEvent.data.player_info, season: '1', episode: '2' },
      },
    }

    expect(parseVidsrcMessage(stringEpisode)).toMatchObject({ season: 1, episode: 2 })
  })

  it('ignores ima strings and foreign tmdb', () => {
    expect(parseVidsrcMessage('ima://{"name":"gpt"}')).toBeNull()
    expect(parseVidsrcMessage({ type: 'PLAYER_TITLE', title: 'x' })).toBeNull()

    const numericTmdb = {
      ...playerEvent,
      data: { ...playerEvent.data, player_info: { ...playerEvent.data.player_info, tmdb: 1396 } },
    }
    expect(parseVidsrcMessage(numericTmdb)).toMatchObject({ kind: 'time', tmdb: '1396' })
  })

  it('rejects NaN progress', () => {
    expect(
      parseVidsrcMessage({ ...playerEvent, data: { ...playerEvent.data, player_progress: NaN } }),
    ).toBeNull()
    expect(
      parseVidsrcMessage({ ...playerEvent, data: { ...playerEvent.data, player_progress: 'abc' } }),
    ).toBeNull()
  })
})

describe('withStartAt', () => {
  const url = 'https://vidsrc.sh/embed/movie'

  it('appends startAt between 30 s and 95% of the duration', () => {
    expect(withStartAt(url + '?a=1', 600, 3480).endsWith('&startAt=600')).toBe(true)
    expect(withStartAt(url, 10, 3480)).toBe(url)
    expect(withStartAt(url, 3400, 3480)).toBe(url)
    expect(withStartAt(url, 600, null)).toBe(url + '?startAt=600')
  })

  it('accepts the exact limits and rejects NaN', () => {
    expect(withStartAt(url, 30, 3480)).toBe(url + '?startAt=30')
    expect(withStartAt(url, 3306, 3480)).toBe(url + '?startAt=3306')
    expect(withStartAt(url, NaN, 3480)).toBe(url)
  })
})
