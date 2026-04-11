import { useState } from 'react'
import { useParams, useNavigate } from 'react-router'
import { useQuery } from '@tanstack/react-query'
import {
  ArrowLeft,
  Mail,
  Calendar,
  Shield,
  CreditCard,
  User,
  Users,
} from 'lucide-react'
import { motion } from 'motion/react'
import { admin } from '../../services/admin'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Skeleton } from '../../components/ui/Skeleton'
import { EmptyState } from '../../components/ui/EmptyState'
import { UpdateSubscriptionModal } from './components/UpdateSubscriptionModal'

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('pt-BR')
}

function DetailSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Skeleton className="h-9 w-9 rounded-lg" />
        <Skeleton className="h-8 w-64" />
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="space-y-6">
          <Skeleton className="h-56 rounded-xl" />
          <Skeleton className="h-40 rounded-xl" />
        </div>
        <Skeleton className="h-72 rounded-xl" />
      </div>
    </div>
  )
}

export function AdminUserDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [isSubscriptionModalOpen, setIsSubscriptionModalOpen] = useState(false)

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['admin', 'users', id],
    queryFn: async () => {
      const response = await admin.getUserDetail(id!)
      if (!response.success) throw new Error('Falha ao carregar usuario')
      return response.data
    },
    staleTime: 30_000,
    enabled: !!id,
  })

  if (isLoading) return <DetailSkeleton />

  if (isError || !data) {
    return (
      <EmptyState
        title="Nao foi possivel carregar o usuario"
        description="Verifique sua conexao e tente novamente."
        action={
          <div className="flex gap-3">
            <Button
              variant="secondary"
              fullWidth={false}
              className="px-5"
              onClick={() => navigate('/admin/users')}
            >
              <ArrowLeft size={18} />
              Voltar
            </Button>
            <Button
              fullWidth={false}
              className="px-5"
              onClick={() => refetch()}
            >
              Tentar novamente
            </Button>
          </div>
        }
      />
    )
  }

  const user = data
  const sub = user.subscription

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
      >
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/admin/users')}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-surface text-text-muted transition-colors hover:bg-border hover:text-text cursor-pointer"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-text sm:text-2xl">
                {user.name}
              </h1>
              <Badge variant={user.role === 'admin' ? 'primary' : 'default'}>
                {user.role}
              </Badge>
            </div>
            <p className="mt-0.5 text-sm text-text-muted">
              Criado em {formatDate(user.createdAt)}
            </p>
          </div>
        </div>
      </motion.header>

      {/* Content grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Left column */}
        <div className="space-y-6">
          {/* Info card */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="rounded-xl border border-border bg-surface p-5"
          >
            <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold text-text-muted">
              <User size={16} />
              Informacoes
            </h2>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Mail size={16} className="shrink-0 text-text-muted" />
                <div>
                  <p className="text-xs text-text-muted">Email</p>
                  <p className="text-sm text-text">{user.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Shield size={16} className="shrink-0 text-text-muted" />
                <div>
                  <p className="text-xs text-text-muted">Role</p>
                  <Badge
                    variant={user.role === 'admin' ? 'primary' : 'default'}
                  >
                    {user.role}
                  </Badge>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Calendar size={16} className="shrink-0 text-text-muted" />
                <div>
                  <p className="text-xs text-text-muted">Criado em</p>
                  <p className="text-sm text-text">
                    {formatDate(user.createdAt)}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Profiles card */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="rounded-xl border border-border bg-surface p-5"
          >
            <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold text-text-muted">
              <Users size={16} />
              Perfis ({user.profiles.length})
            </h2>

            {user.profiles.length === 0 ? (
              <p className="text-sm text-text-muted">Nenhum perfil criado</p>
            ) : (
              <div className="space-y-2">
                {user.profiles.map((profile) => (
                  <div
                    key={profile.id}
                    className="flex items-center justify-between rounded-lg border border-border/50 px-3 py-2"
                  >
                    <p className="text-sm text-text">{profile.name}</p>
                    {profile.isKid && (
                      <Badge variant="warning">Kids</Badge>
                    )}
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        </div>

        {/* Right column — Subscription */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }}
          className="rounded-xl border border-border bg-surface p-5"
        >
          <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold text-text-muted">
            <CreditCard size={16} />
            Assinatura
          </h2>

          {sub ? (
            <div className="space-y-4">
              <div>
                <p className="text-xs text-text-muted">Plano</p>
                <p className="text-lg font-semibold text-text">
                  {sub.plan.name}
                </p>
              </div>

              <div>
                <p className="text-xs text-text-muted">Status</p>
                <Badge
                  variant={sub.status === 'active' ? 'success' : 'error'}
                >
                  {sub.status}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-text-muted">Inicio</p>
                  <p className="text-sm text-text">
                    {formatDate(sub.startedAt)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-text-muted">Termino</p>
                  <p className="text-sm text-text">
                    {sub.endsAt ? formatDate(sub.endsAt) : 'Indefinido'}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-text-muted">Max. perfis</p>
                  <p className="text-sm text-text">{sub.plan.maxProfiles}</p>
                </div>
                <div>
                  <p className="text-xs text-text-muted">Max. streams</p>
                  <p className="text-sm text-text">{sub.plan.maxStreams}</p>
                </div>
              </div>

              <Button
                fullWidth={false}
                className="mt-2 px-5"
                onClick={() => setIsSubscriptionModalOpen(true)}
              >
                Alterar plano
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-text-muted">
                Este usuario nao possui assinatura ativa.
              </p>
              <Button
                fullWidth={false}
                className="px-5"
                onClick={() => setIsSubscriptionModalOpen(true)}
              >
                Atribuir plano
              </Button>
            </div>
          )}
        </motion.div>
      </div>

      {/* Subscription modal */}
      <UpdateSubscriptionModal
        open={isSubscriptionModalOpen}
        onClose={() => setIsSubscriptionModalOpen(false)}
        userId={id!}
        currentPlanId={sub?.plan.id}
      />
    </div>
  )
}
