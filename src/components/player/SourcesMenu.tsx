import { useEffect, useRef } from 'react'
import { Check } from 'lucide-react'
import type { PlayerSource } from '../../types/player'

interface SourcesMenuProps {
  sources: PlayerSource[]
  current: PlayerSource | null
  onSelect(source: PlayerSource): void
  onClose(): void
}

const GROUPS = [
  { audio: 'dublado', title: 'Dublado' },
  { audio: 'legendado', title: 'Legendado' },
] as const

export function SourcesMenu({ sources, current, onSelect, onClose }: SourcesMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null)

  // Clique no vídeo não chega ao documento (é dentro do iframe): fecha também no blur da janela.
  useEffect(() => {
    function handlePointerDown(e: PointerEvent) {
      if (!menuRef.current?.parentElement?.contains(e.target as Node)) onClose()
    }
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }

    document.addEventListener('pointerdown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)
    window.addEventListener('blur', onClose)
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('blur', onClose)
    }
  }, [onClose])

  return (
    <div
      ref={menuRef}
      role="menu"
      className="absolute right-0 top-full mt-1 w-60 max-h-[70vh] overflow-y-auto rounded-lg border border-border bg-surface py-1 shadow-xl shadow-black/40"
    >
      {GROUPS.map(({ audio, title }) => {
        const items = sources.filter((s) => s.audio === audio)
        if (items.length === 0) return null
        return (
          <div key={audio}>
            <p className="px-3 pt-2 pb-1 text-xs font-semibold uppercase text-text-muted">
              {title}
            </p>
            {items.map((s) => (
              <button
                key={s.url}
                type="button"
                role="menuitemradio"
                aria-checked={s === current}
                onClick={() => onSelect(s)}
                className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-text transition-colors hover:bg-border/30 cursor-pointer"
              >
                <Check size={16} className={s === current ? 'text-primary' : 'invisible'} />
                {s.label}
              </button>
            ))}
          </div>
        )
      })}
    </div>
  )
}
