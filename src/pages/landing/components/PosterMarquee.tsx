interface PosterMarqueeProps {
  posters: readonly string[]
  reverse?: boolean
}

export function PosterMarquee({ posters, reverse = false }: PosterMarqueeProps) {
  const items = [...posters, ...posters, ...posters]
  const animationClass = reverse ? 'wp-marquee-reverse' : 'wp-marquee'

  return (
    <div className="relative overflow-hidden">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-linear-to-r from-background to-transparent sm:w-24"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-linear-to-l from-background to-transparent sm:w-24"
      />
      <div className={`${animationClass} flex w-max gap-4 sm:gap-5`}>
        {items.map((src, i) => (
          <div
            key={`${src}-${i}`}
            className="group relative aspect-2/3 w-28 shrink-0 overflow-hidden rounded-xl border border-border bg-surface shadow-lg transition-transform duration-300 hover:scale-105 sm:w-36 lg:w-40"
          >
            <img
              src={src}
              alt=""
              width={185}
              height={277}
              loading="lazy"
              decoding="async"
              className="h-full w-full select-none object-cover transition-opacity duration-300 group-hover:opacity-90"
              draggable={false}
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
              style={{
                background:
                  'radial-gradient(circle at 50% 100%, rgba(155, 79, 222, 0.45) 0%, transparent 60%)',
              }}
            />
          </div>
        ))}
      </div>
    </div>
  )
}
