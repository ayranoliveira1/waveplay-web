import { ChevronDown } from 'lucide-react'
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
    <div className="relative inline-block">
      <select
        value={selectedSeason}
        onChange={(e) => onSelect(Number(e.target.value))}
        className="appearance-none bg-surface text-text text-sm font-medium rounded-lg pl-4 pr-10 py-2.5 outline-none focus:ring-2 focus:ring-primary cursor-pointer"
      >
        {filtered.map((season) => (
          <option key={season.id} value={season.seasonNumber}>
            {season.name}
          </option>
        ))}
      </select>
      <ChevronDown
        size={16}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none"
      />
    </div>
  )
}
