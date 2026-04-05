import { Link } from 'react-router'
import { Lock } from 'lucide-react'

interface SubscriptionBannerProps {
  reason: 'no-plan' | 'expired'
}

const messages = {
  'no-plan': 'Assine um plano para assistir',
  expired: 'Seu plano expirou. Renove para continuar assistindo',
} as const

export function SubscriptionBanner({ reason }: SubscriptionBannerProps) {
  return (
    <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/60">
      <div className="flex flex-col items-center gap-3 px-4 text-center">
        <Lock size={36} className="text-text-muted" />
        <p className="text-sm sm:text-base font-semibold text-text max-w-xs">
          {messages[reason]}
        </p>
        <Link
          to="/settings/plans"
          className="mt-1 inline-flex items-center gap-2 h-10 px-6 rounded-lg bg-primary font-semibold text-sm text-text transition-colors hover:bg-primary-light"
        >
          Ver planos
        </Link>
      </div>
    </div>
  )
}
