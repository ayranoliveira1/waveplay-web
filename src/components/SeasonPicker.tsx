import type { CatalogSeason } from '../types/api'

interface SeasonPickerProps {
  seasons: CatalogSeason[]
  selectedSeason: number
  onSelect: (seasonNumber: number) => void
}

export function SeasonPicker({ seasons, selectedSeason, onSelect }: SeasonPickerProps) {
  const filtered = seasons.filter((s) => s.seasonNumber > 0)

  if (filtered.length === 0) return null

  return (
    <div className="flex gap-2 overflow-x-auto scrollbar-hide py-1">
      {filtered.map((season) => {
        const isSelected = season.seasonNumber === selectedSeason
        return (
          <button
            key={season.id}
            onClick={() => onSelect(season.seasonNumber)}
            className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors cursor-pointer ${
              isSelected
                ? 'bg-primary text-text'
                : 'bg-surface text-text-muted hover:text-text'
            }`}
          >
            {season.name}
          </button>
        )
      })}
    </div>
  )
}
