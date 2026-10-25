import { useEffect, useEffectEvent, useState } from 'react'

const COUNTDOWN_SECONDS = 5

interface NextEpisodeCardProps {
  title: string
  onCancel(): void
  onPlay(): void
}

export function NextEpisodeCard({ title, onCancel, onPlay }: NextEpisodeCardProps) {
  const [left, setLeft] = useState(COUNTDOWN_SECONDS)
  const play = useEffectEvent(onPlay)

  useEffect(() => {
    if (left === 0) {
      play()
      return
    }
    const timer = setTimeout(() => setLeft(left - 1), 1000)
    return () => clearTimeout(timer)
  }, [left])

  return (
    <div className="absolute bottom-24 right-6 z-20 flex w-80 max-w-[calc(100vw-3rem)] items-center gap-4 rounded-xl bg-surface/95 p-4 shadow-xl shadow-black/40">
      <div className="relative h-12 w-12 shrink-0">
        <svg viewBox="0 0 48 48" className="h-full w-full -rotate-90">
          <circle cx="24" cy="24" r="21" fill="none" strokeWidth="4" className="stroke-white/15" />
          <circle
            cx="24"
            cy="24"
            r="21"
            fill="none"
            strokeWidth="4"
            pathLength={100}
            strokeDasharray={100}
            className="stroke-primary wp-countdown"
          />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-text">
          {left}
        </span>
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-text line-clamp-2">{title}</p>
        <div className="mt-3 flex gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="h-8 px-3 rounded-lg bg-background text-xs font-semibold text-text-muted transition-colors hover:text-text cursor-pointer"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onPlay}
            className="h-8 px-3 rounded-lg bg-primary text-xs font-semibold text-text transition-colors hover:bg-primary-light cursor-pointer"
          >
            Assistir agora
          </button>
        </div>
      </div>
    </div>
  )
}
