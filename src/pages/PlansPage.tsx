import { useQuery } from '@tanstack/react-query'
import { ArrowLeft, Users, Monitor, AlertCircle } from 'lucide-react'
import { plans } from '../services/plans'
import { useAuth } from '../hooks/useAuth'
import { Skeleton } from '../components/ui/Skeleton'
import type { Plan } from '../types/api'

function formatPrice(priceCents: number): string {
  if (priceCents === 0) return 'Grátis'
  const reais = Math.floor(priceCents / 100)
  const centavos = String(priceCents % 100).padStart(2, '0')
  return `R$ ${reais},${centavos}`
}

function PlanCard({ plan, isCurrent }: { plan: Plan; isCurrent: boolean }) {
  return (
    <div
      className={`rounded-xl p-5 ${isCurrent ? 'border border-primary bg-primary/10' : 'bg-surface'}`}
    >
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-text">{plan.name}</h3>
        {isCurrent && (
          <span className="rounded-full bg-primary/20 px-3 py-1 text-xs font-semibold text-primary">
            Seu plano
          </span>
        )}
      </div>

      <p className="mt-2 text-2xl font-bold text-text">
        {formatPrice(plan.priceCents)}
        {plan.priceCents > 0 && (
          <span className="text-sm font-normal text-text-muted">/mês</span>
        )}
      </p>

      <p className="mt-2 text-sm text-text-muted">{plan.description}</p>

      <div className="mt-4 space-y-2">
        <div className="flex items-center gap-2">
          <Users size={16} className="text-text-muted" />
          <span className="text-sm text-text-muted">
            Até {plan.maxProfiles} perfil{plan.maxProfiles > 1 ? 's' : ''}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Monitor size={16} className="text-text-muted" />
          <span className="text-sm text-text-muted">
            {plan.maxStreams} tela{plan.maxStreams > 1 ? 's' : ''} simultânea
            {plan.maxStreams > 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {!isCurrent && (
        <div className="mt-4 flex items-center justify-center rounded-lg bg-surface/80 py-3 opacity-50">
          <span className="text-sm font-medium text-text-muted">Em breve</span>
        </div>
      )}
    </div>
  )
}

export function PlansPage() {
  const { user } = useAuth()
  const currentSlug = user?.subscription?.plan.slug ?? ''

  const { data, isLoading, isError } = useQuery({
    queryKey: ['plans'],
    queryFn: async () => {
      const res = await plans.getPlans()
      return res.success ? res.data.plans : null
    },
  })

  if (isLoading) {
    return (
      <div className="py-6">
        <Skeleton className="h-8 w-40 rounded mb-2" />
        <Skeleton className="h-5 w-64 rounded mb-6" />
        <div className="grid gap-4 md:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-64 rounded-xl" />
          ))}
        </div>
      </div>
    )
  }

  if (isError || !data) {
    return (
      <div className="py-6">
        <button
          onClick={() => window.history.back()}
          className="flex items-center gap-1.5 text-text/80 hover:text-text transition-colors cursor-pointer mb-6"
        >
          <ArrowLeft size={20} />
          <span className="text-sm">Voltar</span>
        </button>
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <AlertCircle size={48} className="text-text-muted mb-4" />
          <p className="text-base text-text-muted">Erro ao carregar planos</p>
        </div>
      </div>
    )
  }

  return (
    <div className="py-6">
      <button
        onClick={() => window.history.back()}
        className="flex items-center gap-1.5 text-text/80 hover:text-text transition-colors cursor-pointer mb-6"
      >
        <ArrowLeft size={20} />
        <span className="text-sm">Voltar</span>
      </button>

      <h1 className="text-xl font-bold text-text">Planos</h1>
      <p className="mt-1 text-sm text-text-muted mb-6">
        Escolha o plano ideal para você
      </p>

      <div className="grid gap-4 md:grid-cols-3">
        {data.map((plan) => (
          <PlanCard
            key={plan.id}
            plan={plan}
            isCurrent={plan.slug === currentSlug}
          />
        ))}
      </div>
    </div>
  )
}
