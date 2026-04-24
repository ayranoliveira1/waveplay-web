import { useMemo, useState } from 'react'
import { useParams, useNavigate } from 'react-router'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  ArrowLeft,
  Calendar,
  CreditCard,
  Mail,
  Pencil,
  Power,
  PowerOff,
  Shield,
  Trash2,
  User,
  Users,
  XCircle,
} from 'lucide-react'
import { motion } from 'motion/react'
import { admin } from '../../services/admin'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Skeleton } from '../../components/ui/Skeleton'
import { EmptyState } from '../../components/ui/EmptyState'
import { ConfirmDialog } from '../../components/ui/ConfirmDialog'
import { UpdateSubscriptionModal } from './components/UpdateSubscriptionModal'
import { EditUserModal } from './components/EditUserModal'
import { toast } from '../../lib/toast'

type ActionType = 'deactivate' | 'activate' | 'delete' | 'remove-plan'

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
  const queryClient = useQueryClient()
  const [isSubscriptionModalOpen, setIsSubscriptionModalOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [confirmAction, setConfirmAction] = useState<ActionType | null>(null)

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

  function invalidateUser() {
    if (!id) return
    queryClient.invalidateQueries({ queryKey: ['admin', 'users', id] })
    queryClient.invalidateQueries({ queryKey: ['admin', 'users'] })
    queryClient.invalidateQueries({ queryKey: ['admin', 'dashboard'] })
  }

  const deactivateMutation = useMutation({
    mutationFn: async () => {
      const response = await admin.deactivateUser(id!)
      if (!response.success) {
        throw new Error(
          response.error?.[0]?.message ?? 'Falha ao desativar usuario',
        )
      }
      return response.data
    },
    onSuccess: () => {
      invalidateUser()
      toast.success('Usuario desativado com sucesso')
      setConfirmAction(null)
    },
    onError: (error: Error) => {
      toast.error(error.message ?? 'Falha ao desativar usuario')
    },
  })

  const activateMutation = useMutation({
    mutationFn: async () => {
      const response = await admin.activateUser(id!)
      if (!response.success) {
        throw new Error(
          response.error?.[0]?.message ?? 'Falha ao ativar usuario',
        )
      }
      return response.data
    },
    onSuccess: () => {
      invalidateUser()
      toast.success('Usuario ativado com sucesso')
      setConfirmAction(null)
    },
    onError: (error: Error) => {
      toast.error(error.message ?? 'Falha ao ativar usuario')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: async () => {
      const response = await admin.deleteUser(id!)
      if (!response.success) {
        throw new Error(
          response.error?.[0]?.message ?? 'Falha ao deletar usuario',
        )
      }
      return response.data
    },
    onSuccess: () => {
      invalidateUser()
      toast.success('Usuario deletado com sucesso')
      setConfirmAction(null)
      navigate('/admin/users')
    },
    onError: (error: Error) => {
      toast.error(error.message ?? 'Falha ao deletar usuario')
    },
  })

  const removePlanMutation = useMutation({
    mutationFn: async () => {
      const response = await admin.cancelUserSubscription(id!)
      if (!response.success) {
        throw new Error(
          response.error?.[0]?.message ?? 'Falha ao remover plano',
        )
      }
      return response.data
    },
    onSuccess: () => {
      invalidateUser()
      toast.success('Plano removido com sucesso')
      setConfirmAction(null)
    },
    onError: (error: Error) => {
      toast.error(error.message ?? 'Falha ao remover plano')
    },
  })

  const pendingMap = {
    deactivate: deactivateMutation.isPending,
    activate: activateMutation.isPending,
    delete: deleteMutation.isPending,
    'remove-plan': removePlanMutation.isPending,
  } as const

  const isConfirmPending = confirmAction ? pendingMap[confirmAction] : false

  const confirmCopy = useMemo(() => {
    if (!confirmAction || !data) return null
    const user = data
    if (confirmAction === 'deactivate') {
      return {
        variant: 'warning' as const,
        title: 'Desativar usuario',
        description: `Desativar ${user.name}? O usuario nao conseguira fazer login e todas as sessoes ativas serao encerradas.`,
        confirmLabel: 'Desativar',
      }
    }
    if (confirmAction === 'activate') {
      return {
        variant: 'warning' as const,
        title: 'Ativar usuario',
        description: `Reativar ${user.name}? O usuario voltara a poder fazer login normalmente.`,
        confirmLabel: 'Ativar',
      }
    }
    if (confirmAction === 'delete') {
      return {
        variant: 'danger' as const,
        title: 'Deletar usuario',
        description: `Deletar ${user.name} permanentemente? Esta acao nao pode ser desfeita.`,
        confirmLabel: 'Deletar',
      }
    }
    return {
      variant: 'warning' as const,
      title: 'Remover plano',
      description: `Remover plano de ${user.name}? O usuario ficara sem plano ativo.`,
      confirmLabel: 'Remover plano',
    }
  }, [confirmAction, data])

  function handleConfirm() {
    if (!confirmAction) return
    if (confirmAction === 'deactivate') deactivateMutation.mutate()
    else if (confirmAction === 'activate') activateMutation.mutate()
    else if (confirmAction === 'delete') deleteMutation.mutate()
    else if (confirmAction === 'remove-plan') removePlanMutation.mutate()
  }

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
  const isAdminUser = user.role === 'admin'
  const canDelete = !isAdminUser && !user.active
  const deleteTooltip = isAdminUser
    ? 'Nao e permitido deletar um administrador'
    : user.active
      ? 'Desative o usuario antes de excluir'
      : undefined

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
              {!user.active && <Badge variant="default">Inativo</Badge>}
            </div>
            <p className="mt-0.5 text-sm text-text-muted">
              Criado em {formatDate(user.createdAt)}
            </p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex flex-wrap gap-2">
          <Button
            variant="secondary"
            fullWidth={false}
            className="px-4"
            onClick={() => setIsEditOpen(true)}
            disabled={isAdminUser}
            title={
              isAdminUser
                ? 'Nao e permitido editar um administrador'
                : undefined
            }
          >
            <Pencil size={16} />
            Editar
          </Button>
          {user.active ? (
            <Button
              variant="secondary"
              fullWidth={false}
              className="px-4"
              onClick={() => setConfirmAction('deactivate')}
              disabled={isAdminUser}
              title={
                isAdminUser
                  ? 'Nao e permitido desativar um administrador'
                  : undefined
              }
            >
              <PowerOff size={16} />
              Desativar
            </Button>
          ) : (
            <Button
              variant="secondary"
              fullWidth={false}
              className="px-4"
              onClick={() => setConfirmAction('activate')}
              disabled={isAdminUser}
              title={
                isAdminUser
                  ? 'Nao e permitido ativar um administrador'
                  : undefined
              }
            >
              <Power size={16} />
              Ativar
            </Button>
          )}
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
                    {profile.isKid && <Badge variant="warning">Kids</Badge>}
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

              <div className="flex flex-wrap gap-2 pt-2">
                <Button
                  fullWidth={false}
                  className="px-5"
                  onClick={() => setIsSubscriptionModalOpen(true)}
                >
                  Alterar plano
                </Button>
                <button
                  type="button"
                  onClick={() => setConfirmAction('remove-plan')}
                  className="flex items-center gap-1.5 rounded-lg px-5 text-sm font-semibold text-error transition-colors hover:bg-error/10 cursor-pointer"
                >
                  <XCircle size={16} />
                  Remover plano
                </button>
              </div>
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

      {/* Delete footer (ghost danger) */}
      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.3 }}
        className="mt-8 border-t border-border pt-6"
      >
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-sm font-semibold text-text">
              Zona de perigo
            </h3>
            <p className="text-xs text-text-muted">
              Apos deletado, o usuario e todos os seus dados sao removidos
              permanentemente.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setConfirmAction('delete')}
            disabled={!canDelete}
            title={deleteTooltip}
            className="flex h-10 items-center gap-1.5 rounded-lg px-5 text-sm font-semibold text-error transition-colors hover:bg-error/10 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
          >
            <Trash2 size={16} />
            Deletar usuario
          </button>
        </div>
      </motion.footer>

      {/* Modals */}
      <UpdateSubscriptionModal
        open={isSubscriptionModalOpen}
        onClose={() => setIsSubscriptionModalOpen(false)}
        userId={id!}
        userName={user.name}
        currentPlanId={sub?.plan.id}
        currentEndsAt={sub?.endsAt ?? null}
      />

      <EditUserModal
        open={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        user={{ id: user.id, name: user.name, email: user.email }}
      />

      {confirmAction && confirmCopy && (
        <ConfirmDialog
          open={!!confirmAction}
          onOpenChange={(o) => !o && setConfirmAction(null)}
          title={confirmCopy.title}
          description={confirmCopy.description}
          variant={confirmCopy.variant}
          confirmLabel={confirmCopy.confirmLabel}
          isPending={isConfirmPending}
          onConfirm={handleConfirm}
        />
      )}
    </div>
  )
}
