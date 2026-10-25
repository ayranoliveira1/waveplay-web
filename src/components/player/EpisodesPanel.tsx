import { useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'motion/react'
import { Film, Loader2, X } from 'lucide-react'
import { catalog } from '../../services/catalog'
import { SeasonPicker } from '../SeasonPicker'
import { EpisodeCard } from '../EpisodeCard'
import type { CatalogSeason } from '../../types/api'
import type { EpisodeRef } from '../../types/player'

interface EpisodesPanelProps {
  seriesId: number
  seasons: CatalogSeason[]
  current: EpisodeRef
  today: string
  onSelect(episode: EpisodeRef): void
  onClose(): void
}

export function EpisodesPanel({
  seriesId,
  seasons,
  current,
  today,
  onSelect,
  onClose,
}: EpisodesPanelProps) {
  const [season, setSeason] = useState(current.season)

  const { data: episodes, isLoading } = useQuery({
    queryKey: ['catalog', 'series', seriesId, 'season', season],
    queryFn: async () => {
      const res = await catalog.getSeasonDetail(seriesId, season)
      return res.success ? res.data.episodes : []
    },
  })

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  return (
    <div className="absolute inset-0 z-30">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />

      <motion.aside
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
        role="dialog"
        aria-modal="true"
        aria-label="Episódios"
        className="absolute right-0 top-0 flex h-full w-[min(420px,100vw)] flex-col bg-surface shadow-2xl shadow-black/60"
      >
        <div className="flex items-center gap-3 p-4">
          <h2 className="flex-1 text-base font-semibold text-text">Episódios</h2>
          <SeasonPicker seasons={seasons} selectedSeason={season} onSelect={setSeason} />
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar"
            className="flex h-9 w-9 items-center justify-center rounded-lg text-text-muted transition-colors hover:bg-border/30 hover:text-text cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 pt-1 pb-4">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 size={24} className="animate-spin text-text-muted" />
            </div>
          ) : episodes && episodes.length > 0 ? (
            <div className="space-y-2">
              {episodes.map((ep) => (
                <div
                  key={ep.id}
                  className={`rounded-lg pl-2 ${
                    ep.seasonNumber === current.season && ep.episodeNumber === current.episode
                      ? 'ring-2 ring-primary'
                      : ''
                  }`}
                >
                  <EpisodeCard
                    episode={ep}
                    seriesId={seriesId}
                    disabled={ep.airDate !== null && ep.airDate > today}
                    onPlay={(s, e) => onSelect({ season: s, episode: e })}
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center py-8 text-center">
              <Film size={32} className="text-text-muted mb-2" />
              <p className="text-sm text-text-muted">Nenhum episódio disponível</p>
            </div>
          )}
        </div>
      </motion.aside>
    </div>
  )
}
