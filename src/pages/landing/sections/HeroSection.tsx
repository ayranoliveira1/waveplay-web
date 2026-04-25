import { Link } from 'react-router'
import { motion, useMotionValue, useReducedMotion, useSpring, useTransform } from 'motion/react'
import { ArrowRight, Sparkles } from 'lucide-react'
import type { MouseEvent } from 'react'
import { BrandWave } from '../components/BrandWave'

const heroTags = [
  'Filmes',
  'Séries',
  '4 perfis',
  'Sincronizado',
  'Multi-tela',
  'Sem fidelidade',
  'Continue assistindo',
  'Catálogo vivo',
]

export function HeroSection() {
  const reduced = useReducedMotion()
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)
  const springX = useSpring(mouseX, { stiffness: 50, damping: 18, mass: 0.8 })
  const springY = useSpring(mouseY, { stiffness: 50, damping: 18, mass: 0.8 })
  const tx = useTransform(springX, [-1, 1], [-14, 14])
  const ty = useTransform(springY, [-1, 1], [-10, 10])

  function handleMouseMove(e: MouseEvent<HTMLDivElement>) {
    if (reduced) return
    const rect = e.currentTarget.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 2 - 1
    const y = ((e.clientY - rect.top) / rect.height) * 2 - 1
    mouseX.set(x)
    mouseY.set(y)
  }

  return (
    <section
      className="wave-grain relative isolate overflow-hidden px-4 pt-20 pb-16 sm:pt-28 sm:pb-24 lg:pt-36 lg:pb-32"
      onMouseMove={handleMouseMove}
    >
      <div
        aria-hidden="true"
        className="wp-spotlight pointer-events-none absolute -top-1/4 left-1/2 -z-10 h-[120%] w-[120%] -translate-x-1/2"
        style={{
          background:
            'radial-gradient(60% 50% at 50% 40%, var(--color-spotlight) 0%, transparent 70%)',
        }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-32 bg-linear-to-b from-transparent to-background"
      />

      <div className="relative z-10 mx-auto grid max-w-6xl gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,440px)] lg:items-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
          className="flex flex-col items-start"
        >
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium text-primary-light">
            <Sparkles size={12} />
            Novo no WavePlay
          </div>

          <h1 className="text-[clamp(2.5rem,7vw,5.25rem)] font-black leading-[0.95] tracking-tight text-text">
            Cinema{' '}
            <span className="relative inline-block whitespace-nowrap">
              sem fim.
              <BrandWave className="absolute -bottom-2 left-0 h-3 w-full sm:-bottom-3 sm:h-4" />
            </span>
            <br />
            <span className="text-gradient-brand">Tudo num só lugar.</span>
          </h1>

          <p className="mt-8 max-w-md text-base text-text-muted sm:text-lg">
            Filmes e séries em catálogo vivo, perfis para a família toda e sincronização entre TV,
            notebook e celular.
          </p>

          <div className="mt-10 flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
            <Link
              to="/auth/register"
              className="group flex h-12 items-center justify-center gap-2 rounded-lg bg-gradient-brand px-7 text-sm font-semibold text-text shadow-[0_8px_30px_rgba(123,47,190,0.45)] transition-transform will-change-transform hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-light"
            >
              Começar grátis
              <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              to="/auth/login"
              className="flex h-12 items-center justify-center rounded-lg border border-border bg-surface/40 px-7 text-sm font-semibold text-text transition-colors hover:border-primary hover:bg-surface focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-light"
            >
              Já tenho conta
            </Link>
          </div>

          <div className="relative mt-12 w-full overflow-hidden sm:max-w-md lg:max-w-lg">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-y-0 left-0 z-10 w-12 bg-linear-to-r from-background to-transparent"
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-y-0 right-0 z-10 w-12 bg-linear-to-l from-background to-transparent"
            />
            <div className="wp-marquee flex w-max gap-3">
              {[...heroTags, ...heroTags, ...heroTags].map((tag, i) => (
                <span
                  key={`${tag}-${i}`}
                  className="whitespace-nowrap rounded-full border border-border bg-surface/40 px-4 py-1.5 text-xs font-medium text-text-muted"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.9, delay: 0.2, ease: 'easeOut' }}
          style={{ x: reduced ? 0 : tx, y: reduced ? 0 : ty }}
          className="relative hidden aspect-square w-full max-w-md justify-self-center lg:block"
        >
          <div
            aria-hidden="true"
            className="absolute inset-8 -z-10 rounded-full"
            style={{
              background:
                'radial-gradient(circle at 50% 50%, var(--color-spotlight) 0%, transparent 65%)',
              filter: 'blur(40px)',
            }}
          />
          <img
            src="/landing/hero.png"
            alt=""
            width={460}
            height={460}
            decoding="async"
            fetchPriority="high"
            className="h-full w-full select-none object-contain drop-shadow-[0_20px_60px_rgba(123,47,190,0.45)]"
            draggable={false}
          />
        </motion.div>
      </div>
    </section>
  )
}
