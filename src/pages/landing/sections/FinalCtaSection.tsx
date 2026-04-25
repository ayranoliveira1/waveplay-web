import { motion } from 'motion/react'
import { Link } from 'react-router'
import { ArrowRight } from 'lucide-react'
import { BrandWave } from '../components/BrandWave'

export function FinalCtaSection() {
  return (
    <section className="wave-grain relative overflow-hidden px-4 py-24 sm:py-32">
      <div
        aria-hidden="true"
        className="wp-spotlight pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            'radial-gradient(circle at 50% 50%, var(--color-spotlight) 0%, transparent 65%)',
        }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-20"
        style={{
          background:
            'linear-gradient(180deg, transparent 0%, rgba(91, 31, 158, 0.18) 50%, transparent 100%)',
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.7, ease: 'easeOut' }}
        className="relative z-10 mx-auto max-w-3xl text-center"
      >
        <span className="inline-block rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium uppercase tracking-wider text-primary-light">
          Pronto?
        </span>
        <h2 className="mt-5 text-[clamp(2.25rem,6vw,4.5rem)] font-black leading-[0.95] tracking-tight text-text">
          Aperte{' '}
          <span className="relative inline-block whitespace-nowrap">
            play.
            <BrandWave className="absolute -bottom-2 left-0 h-3 w-full sm:-bottom-3 sm:h-4" />
          </span>
        </h2>
        <p className="mx-auto mt-6 max-w-xl text-base text-text-muted sm:text-lg">
          Crie sua conta em menos de um minuto. Sem cartão, sem fidelidade — só você e milhares de
          títulos esperando.
        </p>
        <Link
          to="/auth/register"
          className="group mx-auto mt-10 inline-flex h-14 items-center justify-center gap-2 rounded-xl bg-gradient-brand px-10 text-base font-bold text-text shadow-[0_15px_40px_rgba(123,47,190,0.55)] transition-transform will-change-transform hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-light"
        >
          Começar agora
          <ArrowRight size={18} className="transition-transform group-hover:translate-x-1.5" />
        </Link>
        <p className="mt-5 text-xs text-text-muted">
          Já tem conta?{' '}
          <Link to="/auth/login" className="text-primary-light hover:underline">
            Entrar
          </Link>
        </p>
      </motion.div>
    </section>
  )
}
