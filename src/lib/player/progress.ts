// Progresso estimado (fontes sem tempo) para em 90% para o "Continuar" nunca dar o
// episódio como visto só por estimativa.
export function capEstimated(progress: number, duration: number): number {
  return Math.min(progress, Math.floor(duration * 0.9))
}
