import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { z } from 'zod'
import { admin } from '../../../services/admin'
import { Modal } from '../../../components/ui/Modal'
import { Input } from '../../../components/ui/Input'
import { Button } from '../../../components/ui/Button'
import { toast } from '../../../lib/toast'

const createPlanSchema = z.object({
  name: z.string().min(1, 'Nome obrigatorio'),
  slug: z
    .string()
    .min(1, 'Slug obrigatorio')
    .regex(/^[a-z0-9-]+$/, 'Apenas letras minusculas, numeros e hifen'),
  priceCents: z.number().int().min(0, 'Preco invalido'),
  maxProfiles: z.number().int().min(1, 'Minimo 1'),
  maxStreams: z.number().int().min(1, 'Minimo 1'),
  description: z.string().max(500),
})

type CreatePlanFormData = z.infer<typeof createPlanSchema>

interface CreatePlanModalProps {
  open: boolean
  onClose: () => void
}

export function CreatePlanModal({ open, onClose }: CreatePlanModalProps) {
  const queryClient = useQueryClient()

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CreatePlanFormData>({
    resolver: zodResolver(createPlanSchema),
  })

  const createMutation = useMutation({
    mutationFn: async (data: CreatePlanFormData) => {
      const response = await admin.createPlan(data)
      if (!response.success) throw new Error('Falha ao criar plano')
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'plans'] })
      queryClient.invalidateQueries({ queryKey: ['admin', 'dashboard'] })
      toast.success('Plano criado com sucesso')
      reset()
      onClose()
    },
    onError: (error: Error) => {
      toast.error(error.message ?? 'Falha ao criar plano')
    },
  })

  function onSubmit(data: CreatePlanFormData) {
    createMutation.mutate(data)
  }

  function handleClose() {
    if (!createMutation.isPending) {
      reset()
      onClose()
    }
  }

  return (
    <Modal open={open} onClose={handleClose} title="Novo plano">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-1">
        <Input
          label="Nome"
          placeholder="Ex: Premium"
          error={errors.name?.message}
          {...register('name')}
        />

        <Input
          label="Slug"
          placeholder="Ex: premium"
          error={errors.slug?.message}
          {...register('slug')}
        />

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
            disabled={createMutation.isPending}
          >
            Cancelar
          </Button>
          <Button type="submit" isLoading={createMutation.isPending}>
            Criar plano
          </Button>
        </div>
      </form>
    </Modal>
  )
}
