import { useState, useEffect } from 'react'
import { Link } from 'react-router'
import { Play, Info, ChevronLeft, ChevronRight } from 'lucide-react'
import { TMDB_IMAGE_SIZES } from '../constants/api'
import { Skeleton } from './ui/Skeleton'
import type { CatalogItem } from '../types/api'

interface HeroBannerProps {
  items: CatalogItem[]
  isLoading?: boolean
}

const AUTO_ROTATE_INTERVAL = 5000

export function HeroBanner({ items, isLoading = false }: HeroBannerProps) {
  const [activeIndex, setActiveIndex] = useState(0)
  const itemCount = items.length

  useEffect(() => {
    if (itemCount <= 1) return

    const id = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % itemCount)
    }, AUTO_ROTATE_INTERVAL)

    return () => clearInterval(id)
  }, [itemCount])

  function goTo(index: number) {
    setActiveIndex(index)
  }

  function goPrev() {
    setActiveIndex((prev) => (prev - 1 + itemCount) % itemCount)
  }

  function goNext() {
    setActiveIndex((prev) => (prev + 1) % itemCount)
  }

  const fullBleed = 'relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] w-[100vw]'

  if (isLoading || items.length === 0) {
    return (
      <div className={`${fullBleed} aspect-[16/9] sm:aspect-[21/9]`}>
        <Skeleton className="h-full w-full rounded-none" />
      </div>
    )
  }

  const item = items[activeIndex]
  if (!item) return null

  const detailPath =
    item.type === 'movie' ? `/browse/movie/${item.id}` : `/browse/series/${item.id}`

  return (
    <div
      className={`${fullBleed} aspect-[16/9] sm:aspect-[21/9] overflow-hidden`}
    >
      {/* Backdrop images — cross-fade */}
      {items.map((slide, i) => (
        <div
          key={`${slide.type}-${slide.id}`}
          className={`absolute inset-0 transition-opacity duration-700 ${
            i === activeIndex ? 'opacity-100' : 'opacity-0'
          }`}
        >
          {slide.backdropPath ? (
            <img
              src={`${TMDB_IMAGE_SIZES.backdrop.large}${slide.backdropPath}`}
              alt={slide.title}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="h-full w-full bg-surface" />
          )}
        </div>
      ))}

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-r from-background/80 via-transparent to-transparent" />

      {/* Content */}
      <div className="absolute inset-0 flex items-end px-4 sm:px-6 md:px-8 lg:px-12 pb-8 sm:pb-12 md:pb-16">
        <div className="max-w-2xl w-full">
          {/* Rating */}
          {item.rating > 0 && (
            <div className="inline-flex items-center gap-1 bg-warning/20 rounded-full px-2.5 py-1 mb-2 sm:mb-3">
              <span className="text-xs text-warning">★</span>
              <span className="text-xs font-bold text-warning">
                {item.rating.toFixed(1)}
              </span>
            </div>
          )}

          <h1 className="text-xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-text mb-2 sm:mb-3 line-clamp-2">
            {item.title}
          </h1>

          {item.overview && (
            <p className="text-xs sm:text-sm md:text-base text-text-muted mb-4 sm:mb-6 line-clamp-2 sm:line-clamp-3">
              {item.overview}
            </p>
          )}

          <div className="flex items-center gap-3">
            <Link
              to={detailPath}
              className="flex items-center gap-2 h-9 sm:h-11 px-4 sm:px-6 rounded-lg bg-primary font-semibold text-xs sm:text-sm text-text transition-colors hover:bg-primary-light"
            >
              <Play size={16} className="fill-text" />
              Assistir
            </Link>
            <Link
              to={detailPath}
              className="flex items-center gap-2 h-9 sm:h-11 px-4 sm:px-6 rounded-lg bg-surface/80 font-semibold text-xs sm:text-sm text-text transition-colors hover:bg-surface"
            >
              <Info size={16} />
              Mais info
            </Link>
          </div>
        </div>
      </div>

      {/* Desktop arrows */}
      {itemCount > 1 && (
        <>
          <button
            onClick={goPrev}
            className="hidden md:flex absolute left-4 lg:left-8 top-1/2 -translate-y-1/2 z-10 h-10 w-10 items-center justify-center rounded-full bg-transparent text-text/70 hover:bg-black/50 hover:text-text transition-colors cursor-pointer"
            aria-label="Slide anterior"
          >
            <ChevronLeft size={24} />
          </button>
          <button
            onClick={goNext}
            className="hidden md:flex absolute right-4 lg:right-8 top-1/2 -translate-y-1/2 z-10 h-10 w-10 items-center justify-center rounded-full bg-transparent text-text/70 hover:bg-black/50 hover:text-text transition-colors cursor-pointer"
            aria-label="Próximo slide"
          >
            <ChevronRight size={24} />
          </button>
        </>
      )}

      {/* Dots — centralizados */}
      {itemCount > 1 && (
        <div className="absolute bottom-3 sm:bottom-4 left-0 right-0 flex items-center justify-center gap-1.5">
          {items.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              className={`rounded-full transition-all cursor-pointer ${
                i === activeIndex
                  ? 'w-2.5 h-2.5 bg-text'
                  : 'w-2 h-2 bg-text/40 hover:bg-text/60'
              }`}
              aria-label={`Slide ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  )
}
