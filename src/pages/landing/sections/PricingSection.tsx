import { motion } from 'motion/react'
import { Link } from 'react-router'
import { Check } from 'lucide-react'
import { plans } from '../data/plans'
import type { Plan } from '../data/plans'

export function PricingSection() {
  return (
    <section className="wave-grain relative overflow-hidden px-4 py-20 sm:py-28">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-[140%] w-[80%] -translate-x-1/2 -translate-y-1/2 opacity-50"
        style={{
          background:
            'radial-gradient(ellipse at center, var(--color-spotlight-soft) 0%, transparent 70%)',
        }}
      />

      <div className="relative z-10 mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="mb-12 text-center sm:mb-16"
        >
          <span className="inline-block rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium uppercase tracking-wider text-primary-light">
            Planos
          </span>
          <h2 className="mt-4 text-3xl font-black leading-tight tracking-tight text-text sm:text-5xl">
            Comece grátis. <span className="text-gradient-brand">Cresça quando quiser.</span>
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-base text-text-muted sm:text-lg">
            Sem fidelidade. Cancele quando quiser, troque de plano em um clique.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-3 lg:items-center">
          {plans.map((plan, index) => (
            <PricingCard key={plan.id} plan={plan} index={index} />
          ))}
        </div>
      </div>
    </section>
  )
}

interface PricingCardProps {
  plan: Plan
  index: number
}

function PricingCard({ plan, index }: PricingCardProps) {
  const isHighlight = plan.highlight
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.5, delay: index * 0.1, ease: 'easeOut' }}
      className={`relative rounded-2xl border p-6 transition-transform sm:p-8 ${
        isHighlight
          ? 'border-primary bg-surface shadow-[0_20px_60px_rgba(123,47,190,0.35)] lg:scale-105'
          : 'border-border bg-surface/50 hover:border-primary/40'
      }`}
    >
      {plan.badge && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-brand px-3 py-1 text-xs font-bold uppercase tracking-wider text-text shadow-lg">
          {plan.badge}
        </span>
      )}

      <div className="flex flex-col gap-1">
        <span className="text-sm font-semibold text-primary-light">{plan.name}</span>
        <p className="text-sm text-text-muted">{plan.tagline}</p>
      </div>

      <div className="mt-5 flex items-baseline gap-1">
        <span
          className={`font-black tracking-tight text-text ${isHighlight ? 'text-5xl' : 'text-4xl'}`}
        >
          {plan.priceLabel}
        </span>
        {plan.period && <span className="text-sm text-text-muted">{plan.period}</span>}
      </div>

      <ul className="mt-6 space-y-3">
        {plan.features.map((feature) => (
          <li key={feature} className="flex items-start gap-2.5 text-sm">
            <Check
              size={16}
              className={`mt-0.5 shrink-0 ${isHighlight ? 'text-primary-light' : 'text-success'}`}
              strokeWidth={2.5}
            />
            <span className="text-text">{feature}</span>
          </li>
        ))}
      </ul>

      <Link
        to="/auth/register"
        className={`mt-7 flex h-11 w-full items-center justify-center rounded-lg text-sm font-semibold transition-transform will-change-transform hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-light ${
          isHighlight
            ? 'bg-gradient-brand text-text shadow-[0_8px_30px_rgba(123,47,190,0.45)]'
            : 'border border-border bg-surface/60 text-text hover:border-primary'
        }`}
      >
        {plan.priceLabel === 'Grátis' ? 'Começar grátis' : `Assinar ${plan.name}`}
      </Link>
    </motion.div>
  )
}
