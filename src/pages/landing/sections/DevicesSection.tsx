import { motion } from 'motion/react'
import { LaptopFrame } from '../components/LaptopFrame'

export function DevicesSection() {
  return (
    <section className="wave-grain relative overflow-hidden px-4 py-20 sm:py-28">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-px bg-linear-to-r from-transparent via-primary/40 to-transparent"
      />

      <div className="relative z-10 mx-auto grid max-w-6xl gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] lg:items-center">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          <span className="inline-block rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium uppercase tracking-wider text-primary-light">
            Multiplataforma
          </span>
          <h2 className="mt-4 text-3xl font-black leading-tight tracking-tight text-text sm:text-5xl">
            TV, notebook, celular.{' '}
            <span className="text-gradient-brand">Continue de onde parou.</span>
          </h2>
          <p className="mt-5 max-w-md text-base text-text-muted sm:text-lg">
            Comece o filme no metrô e termine no sofá. O WavePlay sincroniza seu progresso entre
            todos os dispositivos automaticamente.
          </p>
          <ul className="mt-8 space-y-3 text-sm text-text-muted sm:text-base">
            <li className="flex items-center gap-3">
              <span className="h-1.5 w-1.5 rounded-full bg-primary-light" />
              Sincronização instantânea entre dispositivos
            </li>
            <li className="flex items-center gap-3">
              <span className="h-1.5 w-1.5 rounded-full bg-primary-light" />
              Funciona em smart TVs, notebooks e celulares
            </li>
            <li className="flex items-center gap-3">
              <span className="h-1.5 w-1.5 rounded-full bg-primary-light" />
              App Android disponível, iOS em breve
            </li>
          </ul>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.7, delay: 0.15, ease: 'easeOut' }}
        >
          <LaptopFrame />
        </motion.div>
      </div>
    </section>
  )
}
