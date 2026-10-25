// Progresso estimado (fontes sem tempo) para logo abaixo de 90%: toda a base trata
// `< 0.9` como em andamento, e o "Continuar" nunca pode dar o episódio como visto só
// por estimativa.
export function capEstimated(progress: number, duration: number): number {
  return Math.min(progress, Math.ceil(duration * 0.9) - 1)
}
