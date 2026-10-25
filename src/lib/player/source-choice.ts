import type { PlayerSource, SourceChoice } from '../../types/player'

function pick(list: PlayerSource[], random: () => number): PlayerSource | null {
  return list[Math.floor(random() * list.length)] ?? null
}

// Sem escolha salva, Dublado vem primeiro; com escolha, mantém áudio e servidor e,
// se o servidor sumiu, sorteia no mesmo áudio antes de sortear entre todas.
export function chooseSource(
  list: PlayerSource[],
  choice: SourceChoice | null,
  random: () => number = Math.random,
): PlayerSource | null {
  if (!choice) return list.find((s) => s.audio === 'dublado') ?? list[0] ?? null

  const server = choice.server.toLowerCase()
  const sameAudio = list.filter((s) => s.audio === choice.audio)
  return (
    sameAudio.find((s) => s.server.toLowerCase() === server) ??
    pick(sameAudio, random) ??
    pick(list, random)
  )
}
