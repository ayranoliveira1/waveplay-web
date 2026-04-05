import type { Genre } from '../types/api'

interface GenreChipsProps {
  genres: Genre[]
  selectedId: number | null
  onSelect: (id: number | null) => void
}

export function GenreChips({ genres, selectedId, onSelect }: GenreChipsProps) {
  return (
    <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2 -mx-4 px-4 sm:-mx-6 sm:px-6 md:-mx-8 md:px-8 lg:-mx-12 lg:px-12">
      <button
        onClick={() => onSelect(null)}
        className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-colors cursor-pointer ${
          selectedId === null
            ? 'bg-primary text-text'
            : 'bg-surface text-text-muted hover:text-text'
        }`}
      >
        Todos
      </button>
      {genres.map((genre) => (
        <button
          key={genre.id}
          onClick={() => onSelect(genre.id)}
          className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-colors cursor-pointer ${
            selectedId === genre.id
              ? 'bg-primary text-text'
              : 'bg-surface text-text-muted hover:text-text'
          }`}
        >
          {genre.name}
        </button>
      ))}
    </div>
  )
}
