import { motion } from 'motion/react'
import { PosterMarquee } from '../components/PosterMarquee'
import { posters } from '../data/posters'

export function ShowcaseSection() {
  const firstRow = posters
  const offset = Math.floor(posters.length / 2)
  const secondRow = [...posters.slice(offset), ...posters.slice(0, offset)]

  return (
    <section className="wave-grain wp-marquee-pause-on-hover relative overflow-hidden py-20 sm:py-28">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-px bg-linear-to-r from-transparent via-primary/40 to-transparent"
      />

      <div className="relative z-10 mx-auto mb-12 max-w-3xl px-4 text-center sm:mb-16">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          <span className="inline-block rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium uppercase tracking-wider text-primary-light">
            Catálogo
          </span>
          <h2 className="mt-4 text-3xl font-black leading-tight tracking-tight text-text sm:text-5xl">
            Milhares de títulos.
            <br />
            <span className="text-gradient-brand">Sempre atualizado.</span>
          </h2>
          <p className="mt-4 text-base text-text-muted sm:text-lg">
            Estreias, clássicos e séries que todo mundo está comentando — em um catálogo que cresce
            todo dia.
          </p>
        </motion.div>
      </div>

      <div className="space-y-4 sm:space-y-5">
        <PosterMarquee posters={firstRow} />
        <PosterMarquee posters={secondRow} reverse />
      </div>

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-px bg-linear-to-r from-transparent via-primary/40 to-transparent"
      />
    </section>
  )
}
