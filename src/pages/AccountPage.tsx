import { useState } from 'react'
import { Link } from 'react-router'
import {
  ArrowLeft,
  User,
  Mail,
  Calendar,
  Gem,
  CheckCircle,
  Play,
  Clock,
  Users,
  Monitor,
  Layers,
  KeyRound,
  LogOut,
  Loader2,
} from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { api } from '../services/api'

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })
}

function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>
  label: string
  value: string
}) {
  return (
    <div className="flex items-center gap-3 px-4 py-3 bg-surface rounded-lg">
      <Icon size={18} className="text-text-muted shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-xs text-text-muted">{label}</p>
        <p className="text-sm font-medium text-text truncate">{value}</p>
      </div>
    </div>
  )
}

export function AccountPage() {
  const { user, signOut } = useAuth()
  const [logoutAllLoading, setLogoutAllLoading] = useState(false)
  const [showLogoutAllConfirm, setShowLogoutAllConfirm] = useState(false)

  async function handleLogoutAll() {
    setLogoutAllLoading(true)
    await api.post('/auth/logout-all')
    signOut()
  }

  if (!user) return null

  const subscription = user.subscription

  return (
    <div className="py-6 max-w-2xl mx-auto">
      <button
        onClick={() => window.history.back()}
        className="flex items-center gap-1.5 text-text/80 hover:text-text transition-colors cursor-pointer mb-6 md:hidden"
      >
        <ArrowLeft size={20} />
        <span className="text-sm">Voltar</span>
      </button>

      <h1 className="text-xl font-bold text-text mb-6">Conta</h1>

      {/* Dados pessoais */}
      <section className="mb-6">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-text-muted mb-2">
          Dados pessoais
        </h2>
        <div className="space-y-2">
          <InfoRow icon={User} label="Nome" value={user.name} />
          <InfoRow icon={Mail} label="Email" value={user.email} />
          <InfoRow icon={Calendar} label="Membro desde" value={formatDate(user.createdAt)} />
        </div>
      </section>

      {/* Assinatura */}
      <section className="mb-6">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-text-muted mb-2">
          Assinatura
        </h2>
        <div className="space-y-2">
          {subscription ? (
            <>
              <InfoRow icon={Gem} label="Plano" value={subscription.plan.name} />
              <InfoRow
                icon={CheckCircle}
                label="Status"
                value={subscription.status === 'active' ? 'Ativa' : subscription.status}
              />
              <InfoRow icon={Play} label="Início" value={formatDate(subscription.startedAt)} />
              <InfoRow
                icon={Clock}
                label="Expira em"
                value={subscription.endsAt ? formatDate(subscription.endsAt) : 'Indefinido'}
              />
              <InfoRow
                icon={Users}
                label="Perfis"
                value={`Até ${subscription.plan.maxProfiles} perfil(is)`}
              />
              <InfoRow
                icon={Monitor}
                label="Telas simultâneas"
                value={`Até ${subscription.plan.maxStreams}`}
              />
            </>
          ) : (
            <div className="flex flex-col items-center py-6 bg-surface rounded-lg">
              <Gem size={32} className="text-text-muted" />
              <p className="mt-2 text-sm text-text-muted">Nenhuma assinatura ativa</p>
            </div>
          )}

          <Link
            to="/settings/plans"
            className="flex items-center justify-between px-4 py-3 bg-surface rounded-lg hover:bg-surface/80 transition-colors"
          >
            <div className="flex items-center gap-3">
              <Layers size={18} className="text-text-muted" />
              <span className="text-sm font-medium text-text">Ver planos disponíveis</span>
            </div>
            <ArrowLeft size={16} className="text-text-muted rotate-180" />
          </Link>
        </div>
      </section>

      {/* Segurança */}
      <section>
        <h2 className="text-xs font-semibold uppercase tracking-wider text-text-muted mb-2">
          Segurança
        </h2>
        <div className="space-y-2">
          <Link
            to="/settings/password"
            className="flex items-center gap-3 px-4 py-3 bg-surface rounded-lg hover:bg-surface/80 transition-colors"
          >
            <KeyRound size={18} className="text-text-muted" />
            <span className="text-sm font-medium text-text">Alterar senha</span>
          </Link>

          {!showLogoutAllConfirm ? (
            <button
              onClick={() => setShowLogoutAllConfirm(true)}
              className="flex items-center gap-3 px-4 py-3 bg-surface rounded-lg w-full hover:bg-surface/80 transition-colors cursor-pointer"
            >
              <LogOut size={18} className="text-red-400" />
              <span className="text-sm font-medium text-red-400">
                Sair de todos os dispositivos
              </span>
            </button>
          ) : (
            <div className="px-4 py-3 bg-surface rounded-lg">
              <p className="text-sm text-text-muted mb-3">
                Todos os dispositivos serão desconectados. Continuar?
              </p>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowLogoutAllConfirm(false)}
                  disabled={logoutAllLoading}
                  className="h-9 px-4 rounded-lg bg-surface/80 text-sm font-medium text-text transition-colors hover:bg-border cursor-pointer disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleLogoutAll}
                  disabled={logoutAllLoading}
                  className="flex items-center gap-2 h-9 px-4 rounded-lg bg-red-500/20 text-sm font-medium text-red-400 transition-colors hover:bg-red-500/30 cursor-pointer disabled:opacity-50"
                >
                  {logoutAllLoading && <Loader2 size={14} className="animate-spin" />}
                  Sair de todos
                </button>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
