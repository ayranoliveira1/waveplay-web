import { describe, expect, it } from 'vitest'
import { chooseSource } from './source-choice'
import type { PlayerSource } from '../../types/player'

function source(audio: PlayerSource['audio'], server: string): PlayerSource {
  return {
    audio,
    server,
    label: `Opção (${server})`,
    url: `https://example.com/${audio}/${server}`,
    sandbox: true,
    reportsTime: false,
  }
}

const abysDub = source('dublado', 'ABYS')
const upnsDub = source('dublado', 'UPNS')
const euaLeg = source('legendado', 'EUA')
const vidsrcLeg = source('legendado', 'VIDSRC')

describe('chooseSource', () => {
  it('same audio and server', () => {
    const list = [euaLeg, upnsDub, abysDub]

    expect(chooseSource(list, { audio: 'dublado', server: 'abys' })).toBe(abysDub)
  })

  it('missing server falls back to same audio', () => {
    const list = [upnsDub, euaLeg]

    expect(chooseSource(list, { audio: 'dublado', server: 'ABYS' }, () => 0)).toBe(upnsDub)
  })

  it('no same audio falls back to any', () => {
    const list = [abysDub, upnsDub]

    expect(chooseSource(list, { audio: 'legendado', server: 'EUA' }, () => 0.99)).toBe(upnsDub)
  })

  it('null choice picks first dublado', () => {
    expect(chooseSource([euaLeg, upnsDub, abysDub], null)).toBe(upnsDub)
  })

  it('null choice without dublado picks first', () => {
    expect(chooseSource([vidsrcLeg, euaLeg], null)).toBe(vidsrcLeg)
  })

  it('empty returns null', () => {
    expect(chooseSource([], null)).toBeNull()
    expect(chooseSource([], { audio: 'dublado', server: 'ABYS' })).toBeNull()
  })
})
