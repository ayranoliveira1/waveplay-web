import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { z } from 'zod'
import { admin } from '../../../services/admin'
import { plans as plansService } from '../../../services/plans'
import { Modal } from '../../../components/ui/Modal'
import { Button } from '../../../components/ui/Button'
import { SubscriptionEndsAtField } from '../../../components/ui/SubscriptionEndsAtField'
import { ConfirmDialog } from '../../../components/ui/ConfirmDialog'
import { toast } from '../../../lib/toast'

const updateSubscriptionSchema = z.object({
  planId: z.string().uuid('Selecione um plano'),
})

type UpdateSubscriptionFormData = z.infer<typeof updateSubscriptionSchema>

interface UpdateSubscriptionModalProps {
  open: boolean
  onClose: () => void
  userId: string
  userName?: string
  currentPlanId?: string
  currentEndsAt?: string | null
}

export function UpdateSubscriptionModal(props: UpdateSubscriptionModalProps) {
  const { open, onClose } = props
  // key garante que o inner remonta com defaults frescos quando o user/plano mudam
  const instanceKey = `${props.userId}:${props.currentPlanId ?? 'none'}:${
    props.currentEndsAt ?? 'none'
  }`

  return open ? (
    <UpdateSubscriptionInner
      key={instanceKey}
      {...props}
      open={open}
      onClose={onClose}
    />
  ) : null
}

function UpdateSubscriptionInner({
  open,
  onClose,
  userId,
  userName,
  currentPlanId,
  currentEndsAt,
}: UpdateSubscriptionModalProps) {
  const queryClient = useQueryClient()
  const [endsAt, setEndsAt] = useState<Date | null>(
    currentEndsAt ? new Date(currentEndsAt) : null,
  )
  const [isRemoveOpen, setIsRemoveOpen] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<UpdateSubscriptionFormData>({
    resolver: zodResolver(updateSubscriptionSchema),
    defaultValues: { planId: currentPlanId ?? '' },
  })

  const { data: plansData } = useQuery({
    queryKey: ['plans', 'public'],
    queryFn: async () => {
      const response = await plansService.getPlans()
      if (!response.success) throw new Error('Falha ao carregar planos')
      return response.data
    },
    enabled: open,
    staleTime: 60_000,
  })

  const updateMutation = useMutation({
    mutationFn: async (data: UpdateSubscriptionFormData) => {
      const response = await admin.updateUserSubscription(userId, {
        planId: data.planId,
        endsAt: endsAt ? endsAt.toISOString() : null,
      })
      if (!response.success) {
        throw new Error(
          response.error?.[0]?.message ?? 'Falha ao atualizar assinatura',
        )
      }
      return response.data
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users', userId] })
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] })
      queryClient.invalidateQueries({ queryKey: ['admin', 'dashboard'] })

      if (data.warning) {
        toast.error(data.warning)
      } else {
        toast.success('Assinatura atualizada com sucesso')
      }

      reset()
      setEndsAt(null)
      onClose()
    },
    onError: (error: Error) => {
      toast.error(error.message ?? 'Falha ao atualizar assinatura')
    },
  })

  const removeMutation = useMutation({
    mutationFn: async () => {
      const response = await admin.cancelUserSubscription(userId)
      if (!response.success) {
        throw new Error(
          response.error?.[0]?.message ?? 'Falha ao remover plano',
        )
      }
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users', userId] })
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] })
      queryClient.invalidateQueries({ queryKey: ['admin', 'dashboard'] })
      toast.success('Plano removido com sucesso')
      setIsRemoveOpen(false)
      reset()
      setEndsAt(null)
      onClose()
    },
    onError: (error: Error) => {
      toast.error(error.message ?? 'Falha ao remover plano')
    },
  })

  function onSubmit(data: UpdateSubscriptionFormData) {
    updateMutation.mutate(data)
  }

  const isBusy = updateMutation.isPending || removeMutation.isPending

  function handleClose() {
    if (!isBusy) {
      reset()
      setEndsAt(null)
      onClose()
    }
  }

  return (
    <>
      <Modal
        open={open}
        onClose={handleClose}
        title={currentPlanId ? 'Alterar plano' : 'Atribuir plano'}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-text-muted">
              Plano
            </label>
            <select
              {...register('planId')}
              className="block h-12 w-full rounded-lg border border-border bg-surface px-3 text-sm text-text outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary"
            >
              <option value="">Selecione um plano</option>
              {plansData?.plans.map((plan) => (
                <option key={plan.id} value={plan.id}>
                  {plan.name} — R$ {(plan.priceCents / 100).toFixed(2)}
                </option>
              ))}
            </select>
            {errors.planId && (
              <p className="mt-1 text-xs text-error">
                {errors.planId.message}
              </p>
            )}
          </div>

          <SubscriptionEndsAtField value={endsAt} onChange={setEndsAt} />

          <div className="flex flex-col gap-3 pt-2 sm:flex-row">
            <Button
              type="button"
              variant="secondary"
              onClick={handleClose}
              disabled={isBusy}
            >
              Cancelar
            </Button>
            <Button type="submit" isLoading={updateMutation.isPending}>
              {currentPlanId ? 'Alterar plano' : 'Atribuir plano'}
            </Button>
          </div>

          {currentPlanId && (
            <div className="border-t border-border pt-4">
              <button
                type="button"
                onClick={() => setIsRemoveOpen(true)}
                disabled={isBusy}
                className="text-sm font-medium text-error transition-colors hover:underline disabled:opacity-50 cursor-pointer"
              >
                Remover plano do usuario
              </button>
            </div>
          )}
        </form>
      </Modal>

      <ConfirmDialog
        open={isRemoveOpen}
        onOpenChange={setIsRemoveOpen}
        title="Remover plano"
        description={
          userName
            ? `Remover plano de ${userName}? O usuario ficara sem plano ativo.`
            : 'Remover plano? O usuario ficara sem plano ativo.'
        }
        variant="warning"
        confirmLabel="Remover plano"
        isPending={removeMutation.isPending}
        onConfirm={() => removeMutation.mutate()}
      />
    </>
  )
}
