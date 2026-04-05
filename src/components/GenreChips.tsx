import { useRef, useCallback } from 'react'
import type { Genre } from '../types/api'

interface GenreChipsProps {
  genres: Genre[]
  selectedId: number | null
  onSelect: (id: number | null) => void
}

export function GenreChips({ genres, selectedId, onSelect }: GenreChipsProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const isDragging = useRef(false)
  const startX = useRef(0)
  const scrollLeft = useRef(0)
  const hasDragged = useRef(false)

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    const el = scrollRef.current
    if (!el) return
    isDragging.current = true
    hasDragged.current = false
    startX.current = e.pageX - el.offsetLeft
    scrollLeft.current = el.scrollLeft
    el.style.cursor = 'grabbing'
  }, [])

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging.current) return
    const el = scrollRef.current
    if (!el) return
    e.preventDefault()
    const x = e.pageX - el.offsetLeft
    const walk = x - startX.current
    if (Math.abs(walk) > 5) hasDragged.current = true
    el.scrollLeft = scrollLeft.current - walk
  }, [])

  const handleMouseUp = useCallback(() => {
    isDragging.current = false
    const el = scrollRef.current
    if (el) el.style.cursor = ''
  }, [])

  const handleClick = useCallback(
    (id: number | null) => {
      if (hasDragged.current) return
      onSelect(id)
    },
    [onSelect],
  )

  return (
    <div
      ref={scrollRef}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      className="flex gap-2 overflow-x-auto scrollbar-hide pb-2 -mx-4 px-4 sm:-mx-6 sm:px-6 md:-mx-8 md:px-8 lg:-mx-12 lg:px-12 select-none"
    >
      <button
        onClick={() => handleClick(null)}
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
          onClick={() => handleClick(genre.id)}
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
