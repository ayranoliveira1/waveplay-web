import { useCallback, useState } from 'react'
import { ArrowLeft, Cast, ChevronRight, Layers, ListVideo, Maximize } from 'lucide-react'
import { SourcesMenu } from './SourcesMenu'
import type { PlayerSource } from '../../types/player'

interface PlayerBarProps {
  title: string
  visible: boolean
  sources: PlayerSource[]
  current: PlayerSource | null
  onActivity(): void
  onBack(): void
  onSelectSource(source: PlayerSource): void
  onCast(): void
  onEpisodes?: () => void
  onNext?: () => void
  nextDisabled?: boolean
  onFullscreen?: () => void
}

const buttonClass =
  'flex items-center gap-1.5 h-10 px-3 rounded-lg text-sm text-text/80 transition-colors hover:text-text hover:bg-white/10 cursor-pointer'

export function PlayerBar({
  title,
  visible,
  sources,
  current,
  onActivity,
  onBack,
  onSelectSource,
  onCast,
  onEpisodes,
  onNext,
  nextDisabled = false,
  onFullscreen,
}: PlayerBarProps) {
  const [sourcesOpen, setSourcesOpen] = useState(false)
  const closeSources = useCallback(() => setSourcesOpen(false), [])
  const shown = visible || sourcesOpen

  // Faixa de 72 px por cima do vídeo: fora dela o iframe engole o ponteiro.
  return (
    <div
      className="absolute inset-x-0 top-0 z-20 h-[72px]"
      onPointerEnter={onActivity}
      onPointerMove={onActivity}
      onPointerDown={onActivity}
      onFocus={onActivity}
    >
      <div
        className={`flex h-full items-center gap-1 sm:gap-2 px-2 sm:px-4 bg-linear-to-b from-black/80 to-transparent transition-opacity duration-300 ${shown ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
      >
        <button type="button" onClick={onBack} className={buttonClass} aria-label="Voltar">
          <ArrowLeft size={20} />
          <span className="hidden sm:inline">Voltar</span>
        </button>

        <h1 className="flex-1 min-w-0 truncate text-sm sm:text-base font-semibold text-text">
          {title}
        </h1>

        {onEpisodes && (
          <button type="button" onClick={onEpisodes} className={buttonClass} aria-label="Episódios">
            <ListVideo size={20} />
            <span className="hidden sm:inline">Episódios</span>
          </button>
        )}

        {onNext && (
          <button
            type="button"
            onClick={onNext}
            disabled={nextDisabled}
            aria-label="Próximo episódio"
            className={`${buttonClass} disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-text/80`}
          >
            <span className="hidden sm:inline">Próximo</span>
            <ChevronRight size={20} />
          </button>
        )}

        {sources.length > 0 && (
          <div className="relative">
            <button
              type="button"
              onClick={() => setSourcesOpen((v) => !v)}
              aria-expanded={sourcesOpen}
              aria-label="Fontes"
              className={buttonClass}
            >
              <Layers size={20} />
              <span className="hidden sm:inline">Fontes</span>
            </button>
            {sourcesOpen && (
              <SourcesMenu
                sources={sources}
                current={current}
                onSelect={(source) => {
                  setSourcesOpen(false)
                  onSelectSource(source)
                }}
                onClose={closeSources}
              />
            )}
          </div>
        )}

        <button type="button" onClick={onCast} className={buttonClass} aria-label="Transmitir">
          <Cast size={20} />
          <span className="hidden sm:inline">Transmitir</span>
        </button>

        {onFullscreen && (
          <button
            type="button"
            onClick={onFullscreen}
            className={buttonClass}
            aria-label="Tela cheia"
          >
            <Maximize size={20} />
          </button>
        )}
      </div>
    </div>
  )
}
