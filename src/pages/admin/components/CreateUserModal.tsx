import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { z } from 'zod'
import { admin } from '../../../services/admin'
import { plans as plansService } from '../../../services/plans'
import { Modal } from '../../../components/ui/Modal'
import { Input } from '../../../components/ui/Input'
import { Button } from '../../../components/ui/Button'
import { toast } from '../../../lib/toast'

// SEM campo `role` — defense in depth (ADR 0001, security 19.15)
const createUserSchema = z.object({
  name: z.string().min(2, 'Nome deve ter no minimo 2 caracteres'),
  email: z.string().email('Email invalido'),
  password: z.string().min(8, 'Senha deve ter no minimo 8 caracteres'),
  planId: z.string().uuid().optional(),
})

type CreateUserFormData = z.infer<typeof createUserSchema>

interface CreateUserModalProps {
  open: boolean
  onClose: () => void
}

export function CreateUserModal({ open, onClose }: CreateUserModalProps) {
  const queryClient = useQueryClient()

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CreateUserFormData>({
    resolver: zodResolver(createUserSchema),
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

  const createMutation = useMutation({
    mutationFn: async (data: CreateUserFormData) => {
      const response = await admin.createUser(data)
      if (!response.success) throw new Error('Falha ao criar usuario')
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] })
      queryClient.invalidateQueries({ queryKey: ['admin', 'dashboard'] })
      toast.success('Usuario criado com sucesso')
      reset()
      onClose()
    },
    onError: (error: Error) => {
      toast.error(error.message ?? 'Falha ao criar usuario')
    },
  })

  function onSubmit(data: CreateUserFormData) {
    createMutation.mutate(data)
  }

  function handleClose() {
    if (!createMutation.isPending) {
      reset()
      onClose()
    }
  }

  return (
    <Modal open={open} onClose={handleClose} title="Novo usuario">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-1">
        <Input
          label="Nome"
          placeholder="Nome completo"
          error={errors.name?.message}
          {...register('name')}
        />

        <Input
          label="Email"
          type="email"
          placeholder="email@exemplo.com"
          error={errors.email?.message}
          {...register('email')}
        />

        <Input
          label="Senha"
          type="password"
          placeholder="Minimo 8 caracteres"
          autoComplete="new-password"
          error={errors.password?.message}
          {...register('password')}
        />

        <div className="mb-5">
          <label className="mb-2 block text-sm font-medium text-text-muted">
            Plano (opcional)
          </label>
          <select
            {...register('planId')}
            className="block h-12 w-full rounded-lg border border-border bg-surface px-3 text-sm text-text outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary"
          >
            <option value="">Sem plano</option>
            {plansData?.plans.map((plan) => (
              <option key={plan.id} value={plan.id}>
                {plan.name}
              </option>
            ))}
          </select>
        </div>

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
            Criar usuario
          </Button>
        </div>
      </form>
    </Modal>
  )
}
