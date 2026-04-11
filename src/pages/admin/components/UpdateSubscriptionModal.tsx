import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { z } from 'zod'
import { admin } from '../../../services/admin'
import { plans as plansService } from '../../../services/plans'
import { Modal } from '../../../components/ui/Modal'
import { Button } from '../../../components/ui/Button'
import { toast } from '../../../lib/toast'

const updateSubscriptionSchema = z.object({
  planId: z.string().uuid('Selecione um plano'),
})

type UpdateSubscriptionFormData = z.infer<typeof updateSubscriptionSchema>

interface UpdateSubscriptionModalProps {
  open: boolean
  onClose: () => void
  userId: string
  currentPlanId?: string
}

export function UpdateSubscriptionModal({
  open,
  onClose,
  userId,
  currentPlanId,
}: UpdateSubscriptionModalProps) {
  const queryClient = useQueryClient()

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<UpdateSubscriptionFormData>({
    resolver: zodResolver(updateSubscriptionSchema),
    defaultValues: { planId: currentPlanId ?? '' },
  })

  useEffect(() => {
    if (open) {
      reset({ planId: currentPlanId ?? '' })
    }
  }, [open, currentPlanId, reset])

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

  const mutation = useMutation({
    mutationFn: async (data: UpdateSubscriptionFormData) => {
      const response = await admin.updateUserSubscription(userId, {
        planId: data.planId,
      })
      if (!response.success) throw new Error('Falha ao atualizar assinatura')
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
      onClose()
    },
    onError: (error: Error) => {
      toast.error(error.message ?? 'Falha ao atualizar assinatura')
    },
  })

  function onSubmit(data: UpdateSubscriptionFormData) {
    mutation.mutate(data)
  }

  function handleClose() {
    if (!mutation.isPending) {
      reset()
      onClose()
    }
  }

  return (
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
            <p className="mt-1 text-xs text-error">{errors.planId.message}</p>
          )}
        </div>

        <div className="flex gap-3 pt-2">
          <Button
            type="button"
            variant="secondary"
            onClick={handleClose}
            disabled={mutation.isPending}
          >
            Cancelar
          </Button>
          <Button type="submit" isLoading={mutation.isPending}>
            {currentPlanId ? 'Alterar plano' : 'Atribuir plano'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
