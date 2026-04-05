import { useRef, useState, useCallback, useEffect, type ReactNode } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Skeleton } from './ui/Skeleton'

interface CarouselProps {
  title: string
  children: ReactNode
  isLoading?: boolean
  skeletonCount?: number
}

export function Carousel({ title, children, isLoading = false, skeletonCount = 6 }: CarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)

  const checkScroll = useCallback(() => {
    const el = scrollRef.current
    if (!el) return
    setCanScrollLeft(el.scrollLeft > 0)
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 1)
  }, [])

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return

    checkScroll()
    el.addEventListener('scroll', checkScroll, { passive: true })
    const observer = new ResizeObserver(checkScroll)
    observer.observe(el)

    return () => {
      el.removeEventListener('scroll', checkScroll)
      observer.disconnect()
    }
  }, [checkScroll, isLoading])

  function scroll(direction: 'left' | 'right') {
    const el = scrollRef.current
    if (!el) return
    const amount = el.clientWidth * 0.75
    el.scrollBy({ left: direction === 'left' ? -amount : amount, behavior: 'smooth' })
  }

  return (
    <section className="py-4 sm:py-6">
      <h2 className="text-lg sm:text-xl font-bold text-text mb-3 sm:mb-4">{title}</h2>

      <div className="group/carousel relative">
        {/* Left arrow (desktop only) */}
        {canScrollLeft && (
          <button
            onClick={() => scroll('left')}
            className="hidden md:flex absolute left-0 top-0 bottom-0 z-10 w-10 items-center justify-center bg-gradient-to-r from-background to-transparent opacity-0 group-hover/carousel:opacity-100 transition-opacity cursor-pointer"
            aria-label="Rolar para esquerda"
          >
            <ChevronLeft size={28} className="text-text" />
          </button>
        )}

        {/* Scroll container */}
        <div
          ref={scrollRef}
          className="flex gap-3 sm:gap-4 overflow-x-auto scrollbar-hide scroll-smooth snap-x snap-mandatory"
        >
          {isLoading
            ? Array.from({ length: skeletonCount }).map((_, i) => (
                <div key={i} className="flex-shrink-0 w-32 sm:w-36 md:w-40">
                  <Skeleton className="aspect-[2/3] rounded-lg" />
                  <Skeleton className="h-4 mt-2 w-3/4 rounded" />
                </div>
              ))
            : children}
        </div>

        {/* Right arrow (desktop only) */}
        {canScrollRight && (
          <button
            onClick={() => scroll('right')}
            className="hidden md:flex absolute right-0 top-0 bottom-0 z-10 w-10 items-center justify-center bg-gradient-to-l from-background to-transparent opacity-0 group-hover/carousel:opacity-100 transition-opacity cursor-pointer"
            aria-label="Rolar para direita"
          >
            <ChevronRight size={28} className="text-text" />
          </button>
        )}
      </div>
    </section>
  )
}
