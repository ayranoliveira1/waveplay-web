import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { CreditCard, Pencil, Plus, Power, Trash2 } from 'lucide-react'
import { motion } from 'motion/react'
import type { AdminPlan } from '../../types/admin'
import { admin } from '../../services/admin'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Skeleton } from '../../components/ui/Skeleton'
import { EmptyState } from '../../components/ui/EmptyState'
import { ConfirmDialog } from '../../components/ui/ConfirmDialog'
import { toast } from '../../lib/toast'
import { CreatePlanModal } from './components/CreatePlanModal'
import { EditPlanModal } from './components/EditPlanModal'

function formatPrice(cents: number): string {
  return `R$ ${(cents / 100).toFixed(2)}`
}

function PlansSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Skeleton className="mb-2 h-8 w-32" />
          <Skeleton className="h-5 w-56" />
        </div>
        <Skeleton className="h-10 w-36" />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-56 rounded-xl" />
        ))}
      </div>
    </div>
  )
}

export function AdminPlansPage() {
  const queryClient = useQueryClient()
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [editingPlan, setEditingPlan] = useState<AdminPlan | null>(null)
  const [confirmDeletePlan, setConfirmDeletePlan] = useState<AdminPlan | null>(
    null,
  )

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['admin', 'plans'],
    queryFn: async () => {
      const response = await admin.listPlans()
      if (!response.success) throw new Error('Falha ao carregar planos')
      return response.data
    },
    staleTime: 30_000,
  })

  const toggleMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await admin.togglePlanActive(id)
      if (!response.success) throw new Error('Falha ao alterar status')
      return response.data
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'plans'] })
      toast.success(
        `Plano ${data.plan.active ? 'ativado' : 'desativado'} com sucesso`,
      )
    },
    onError: (error: Error) => {
      toast.error(error.message ?? 'Falha ao alterar status')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: async (plan: AdminPlan) => {
      const response = await admin.deletePlan(plan.id)
      if (!response.success) {
        throw new Error(
          response.error?.[0]?.message ?? 'Falha ao excluir plano',
        )
      }
      return plan
    },
    onSuccess: (plan) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'plans'] })
      queryClient.invalidateQueries({ queryKey: ['admin', 'dashboard'] })
      toast.success(`Plano "${plan.name}" excluido`)
      setConfirmDeletePlan(null)
    },
    onError: (error: Error) => {
      toast.error(error.message ?? 'Falha ao excluir plano')
      queryClient.invalidateQueries({ queryKey: ['admin', 'plans'] })
    },
  })

  if (isLoading) return <PlansSkeleton />

  if (isError) {
    return (
      <EmptyState
        title="Nao foi possivel carregar os planos"
        description="Verifique sua conexao e tente novamente."
        action={
          <Button fullWidth={false} className="px-6" onClick={() => refetch()}>
            Tentar novamente
          </Button>
        }
      />
    )
  }

  const plans = data?.plans ?? []

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"
      >
        <div>
          <div className="flex items-center gap-2">
            <CreditCard size={22} className="text-primary" />
            <h1 className="text-2xl font-bold text-text sm:text-3xl">
              Planos
            </h1>
          </div>
          <p className="mt-1 text-sm text-text-muted">
            Gerencie os planos do WavePlay
          </p>
        </div>

        <Button fullWidth={false} onClick={() => setIsCreateModalOpen(true)}>
          <Plus size={18} />
          Novo plano
        </Button>
      </motion.header>

      {/* Content */}
      {plans.length === 0 ? (
        <EmptyState
          title="Nenhum plano cadastrado"
          description="Crie o primeiro plano para comecar."
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {plans.map((plan, i) => {
            const canDelete = plan.usersCount === 0
            return (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                className={`flex flex-col rounded-xl border bg-surface p-5 transition-colors ${
                  plan.active
                    ? 'border-border hover:border-primary/30'
                    : 'border-border/50 opacity-60'
                }`}
              >
                {/* Plan header */}
                <div className="mb-3 flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-lg font-semibold text-text">
                      {plan.name}
                    </h3>
                    <p className="text-xs text-text-muted">{plan.slug}</p>
                  </div>
                  <Badge variant={plan.active ? 'success' : 'error'}>
                    {plan.active ? 'Ativo' : 'Inativo'}
                  </Badge>
                </div>

                {/* Price */}
                <p className="mb-4 text-2xl font-bold text-primary">
                  {formatPrice(plan.priceCents)}
                  <span className="text-sm font-normal text-text-muted">
                    /mes
                  </span>
                </p>

                {/* Limits */}
                <div className="mb-4 grid grid-cols-2 gap-3">
                  <div className="rounded-lg border border-border/50 px-3 py-2 text-center">
                    <p className="text-lg font-semibold text-text">
                      {plan.maxProfiles}
                    </p>
                    <p className="text-xs text-text-muted">Perfis</p>
                  </div>
                  <div className="rounded-lg border border-border/50 px-3 py-2 text-center">
                    <p className="text-lg font-semibold text-text">
                      {plan.maxStreams}
                    </p>
                    <p className="text-xs text-text-muted">Streams</p>
                  </div>
                </div>

                {/* Description */}
                {plan.description && (
                  <p className="mb-3 line-clamp-2 text-sm text-text-muted">
                    {plan.description}
                  </p>
                )}

                {/* Subscriptions count */}
                {plan.usersCount > 0 ? (
                  <p className="mb-2 text-xs text-text-muted">
                    {plan.usersCount}{' '}
                    {plan.usersCount === 1
                      ? 'assinatura vinculada'
                      : 'assinaturas vinculadas'}
                  </p>
                ) : (
                  <p className="mb-2 text-xs text-success/80">
                    Nenhuma assinatura vinculada
                  </p>
                )}

                {/* Auxiliary text when cannot delete */}
                {!canDelete && (
                  <p className="mb-3 text-xs italic text-text-muted/80">
                    Remova todas as assinaturas vinculadas (inclusive
                    historicas) para poder excluir.
                  </p>
                )}

                {/* Actions */}
                <div className="mt-auto flex flex-col gap-2 pt-3 sm:flex-row">
                  <button
                    type="button"
                    onClick={() => setEditingPlan(plan)}
                    className="flex h-9 flex-1 items-center justify-center gap-1.5 rounded-lg border border-border bg-surface text-sm text-text-muted transition-colors hover:bg-border hover:text-text cursor-pointer"
                  >
                    <Pencil size={14} />
                    Editar
                  </button>
                  <button
                    type="button"
                    onClick={() => toggleMutation.mutate(plan.id)}
                    disabled={toggleMutation.isPending}
                    className={`flex h-9 flex-1 items-center justify-center gap-1.5 rounded-lg border text-sm transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
                      plan.active
                        ? 'border-warning/30 text-warning hover:bg-warning/10'
                        : 'border-success/30 text-success hover:bg-success/10'
                    }`}
                  >
                    <Power size={14} />
                    {plan.active ? 'Desativar' : 'Ativar'}
                  </button>
                  {canDelete && (
                    <button
                      type="button"
                      onClick={() => setConfirmDeletePlan(plan)}
                      disabled={
                        deleteMutation.isPending &&
                        deleteMutation.variables?.id === plan.id
                      }
                      className="flex h-9 flex-1 items-center justify-center gap-1.5 rounded-lg border border-error/30 text-sm text-error transition-colors hover:bg-error/10 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer sm:order-last sm:ml-auto sm:flex-none sm:px-4"
                    >
                      <Trash2 size={14} />
                      Excluir
                    </button>
                  )}
                </div>
              </motion.div>
            )
          })}
        </div>
      )}

      {/* Modals */}
      <CreatePlanModal
        open={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />

      {editingPlan && (
        <EditPlanModal
          open={!!editingPlan}
          onClose={() => setEditingPlan(null)}
          plan={editingPlan}
        />
      )}

      {confirmDeletePlan && (
        <ConfirmDialog
          open={!!confirmDeletePlan}
          onOpenChange={(o) => !o && setConfirmDeletePlan(null)}
          title={`Excluir plano "${confirmDeletePlan.name}"?`}
          description="Esta acao e permanente e nao pode ser desfeita."
          variant="danger"
          confirmLabel="Excluir"
          cancelLabel="Cancelar"
          isPending={deleteMutation.isPending}
          onConfirm={() => deleteMutation.mutate(confirmDeletePlan)}
        />
      )}
    </div>
  )
}
