import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { z } from 'zod'
import type { AdminPlan } from '../../../types/admin'
import { admin } from '../../../services/admin'
import { Modal } from '../../../components/ui/Modal'
import { Input } from '../../../components/ui/Input'
import { Button } from '../../../components/ui/Button'
import { toast } from '../../../lib/toast'

const editPlanSchema = z.object({
  name: z.string().min(1, 'Nome obrigatorio'),
  priceCents: z.number().int().min(0, 'Preco invalido'),
  maxProfiles: z.number().int().min(1, 'Minimo 1'),
  maxStreams: z.number().int().min(1, 'Minimo 1'),
  description: z.string().max(500),
})

type EditPlanFormData = z.infer<typeof editPlanSchema>

interface EditPlanModalProps {
  open: boolean
  onClose: () => void
  plan: AdminPlan
}

export function EditPlanModal({ open, onClose, plan }: EditPlanModalProps) {
  const queryClient = useQueryClient()

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<EditPlanFormData>({
    resolver: zodResolver(editPlanSchema),
    defaultValues: {
      name: plan.name,
      priceCents: plan.priceCents,
      maxProfiles: plan.maxProfiles,
      maxStreams: plan.maxStreams,
      description: plan.description ?? '',
    },
  })

  useEffect(() => {
    if (open) {
      reset({
        name: plan.name,
        priceCents: plan.priceCents,
        maxProfiles: plan.maxProfiles,
        maxStreams: plan.maxStreams,
        description: plan.description ?? '',
      })
    }
  }, [open, plan, reset])

  const updateMutation = useMutation({
    mutationFn: async (data: EditPlanFormData) => {
      const response = await admin.updatePlan(plan.id, data)
      if (!response.success) throw new Error('Falha ao atualizar plano')
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'plans'] })
      toast.success('Plano atualizado com sucesso')
      reset()
      onClose()
    },
    onError: (error: Error) => {
      toast.error(error.message ?? 'Falha ao atualizar plano')
    },
  })

  function onSubmit(data: EditPlanFormData) {
    updateMutation.mutate(data)
  }

  function handleClose() {
    if (!updateMutation.isPending) {
      reset()
      onClose()
    }
  }

  return (
    <Modal open={open} onClose={handleClose} title="Editar plano">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-1">
        <Input
          label="Nome"
          placeholder="Ex: Premium"
          error={errors.name?.message}
          {...register('name')}
        />

        <div className="mb-5">
          <label className="mb-2 block text-sm font-medium text-text-muted">
            Slug
          </label>
          <input
            value={plan.slug}
            disabled
            className="block h-12 w-full rounded-lg border border-border bg-border/20 px-3 text-sm text-text-muted outline-none cursor-not-allowed"
          />
          <p className="mt-1 text-xs text-text-muted">
            Slug nao pode ser alterado
          </p>
        </div>

        <Input
          label="Preco (centavos)"
          type="number"
          placeholder="Ex: 2990"
          error={errors.priceCents?.message}
          {...register('priceCents', { valueAsNumber: true })}
        />

        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Max. perfis"
            type="number"
            placeholder="Ex: 5"
            error={errors.maxProfiles?.message}
            {...register('maxProfiles', { valueAsNumber: true })}
          />
          <Input
            label="Max. streams"
            type="number"
            placeholder="Ex: 2"
            error={errors.maxStreams?.message}
            {...register('maxStreams', { valueAsNumber: true })}
          />
        </div>

        <Input
          label="Descricao (opcional)"
          placeholder="Descricao do plano"
          error={errors.description?.message}
          {...register('description')}
        />

        <div className="flex gap-3 pt-2">
          <Button
            type="button"
            variant="secondary"
            onClick={handleClose}
            disabled={updateMutation.isPending}
          >
            Cancelar
          </Button>
          <Button type="submit" isLoading={updateMutation.isPending}>
            Salvar
          </Button>
        </div>
      </form>
    </Modal>
  )
}
