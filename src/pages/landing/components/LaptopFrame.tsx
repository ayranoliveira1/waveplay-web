import { useEffect, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { Film, Users, Sparkles } from 'lucide-react'

const frames = [
  {
    id: 'continue',
    icon: Film,
    eyebrow: 'Continue assistindo',
    title: 'Inception',
    meta: '1h 32min restantes · 68%',
    gradient: 'linear-gradient(135deg, #5B1F9E 0%, #7B2FBE 60%, #9B4FDE 100%)',
  },
  {
    id: 'profile',
    icon: Users,
    eyebrow: 'Trocar perfil',
    title: 'Maria',
    meta: '5 perfis disponíveis',
    gradient: 'linear-gradient(135deg, #1E3A8A 0%, #3B82F6 60%, #60A5FA 100%)',
  },
  {
    id: 'discover',
    icon: Sparkles,
    eyebrow: 'Em alta hoje',
    title: '23 títulos novos',
    meta: 'Recomendados para você',
    gradient: 'linear-gradient(135deg, #831843 0%, #BE185D 60%, #EC4899 100%)',
  },
] as const

export function LaptopFrame() {
  const reduced = useReducedMotion()
  const [index, setIndex] = useState(0)

  useEffect(() => {
    if (reduced) return
    const id = window.setInterval(() => {
      setIndex((prev) => (prev + 1) % frames.length)
    }, 3600)
    return () => window.clearInterval(id)
  }, [reduced])

  const current = frames[index]!
  const Icon = current.icon

  return (
    <div className="relative mx-auto w-full max-w-2xl">
      <div
        className="relative rounded-t-2xl border border-border bg-surface p-2 shadow-[0_30px_80px_rgba(123,47,190,0.35)] sm:p-3"
        style={{
          backgroundImage: 'linear-gradient(180deg, #20203A 0%, #1A1A2E 100%)',
        }}
      >
        <div
          className="relative aspect-16/10 overflow-hidden rounded-lg"
          style={{ background: '#0A0A0F' }}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={current.id}
              initial={{ opacity: 0, scale: 1.04 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
              className="absolute inset-0 flex flex-col justify-end p-5 sm:p-8"
              style={{ background: current.gradient }}
            >
              <div
                aria-hidden="true"
                className="absolute inset-0"
                style={{
                  background: 'linear-gradient(180deg, transparent 40%, rgba(0,0,0,0.55) 100%)',
                }}
              />
              <div className="relative">
                <span className="inline-flex items-center gap-2 rounded-full bg-black/30 px-3 py-1 text-xs font-medium uppercase tracking-wider text-white/90 backdrop-blur-sm">
                  <Icon size={12} />
                  {current.eyebrow}
                </span>
                <h3 className="mt-3 text-2xl font-black tracking-tight text-white sm:text-4xl">
                  {current.title}
                </h3>
                <p className="mt-1 text-xs text-white/70 sm:text-sm">{current.meta}</p>
              </div>
            </motion.div>
          </AnimatePresence>

          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 rounded-lg"
            style={{
              boxShadow: 'inset 0 0 60px rgba(0,0,0,0.4)',
            }}
          />
        </div>

        <div className="mt-2 flex items-center justify-center gap-1.5 sm:mt-3">
          {frames.map((f, i) => (
            <span
              key={f.id}
              className={`h-1 rounded-full transition-all duration-500 ${
                i === index ? 'w-6 bg-primary-light' : 'w-1.5 bg-border'
              }`}
            />
          ))}
        </div>
      </div>
      <div
        aria-hidden="true"
        className="mx-auto h-3 w-[110%] -translate-y-px rounded-b-2xl border-x border-b border-border bg-surface-elevated shadow-2xl"
      />
      <div aria-hidden="true" className="mx-auto h-1 w-1/3 rounded-b-full bg-border" />
    </div>
  )
}
