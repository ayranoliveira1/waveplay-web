import { useState } from 'react'
import { useNavigate } from 'react-router'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { z } from 'zod'
import { ArrowLeft, Lock } from 'lucide-react'
import { auth } from '../services/auth'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { toast } from '../lib/toast'

const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Senha atual obrigatória'),
    newPassword: z
      .string()
      .min(8, 'Mínimo 8 caracteres')
      .regex(/[A-Z]/, 'Pelo menos 1 letra maiúscula')
      .regex(/[a-z]/, 'Pelo menos 1 letra minúscula')
      .regex(/\d/, 'Pelo menos 1 número'),
    confirmPassword: z.string().min(1, 'Confirme a nova senha'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'As senhas não conferem',
    path: ['confirmPassword'],
  })
  .refine((data) => data.newPassword !== data.currentPassword, {
    message: 'A nova senha deve ser diferente da atual',
    path: ['newPassword'],
  })

type ChangePasswordForm = z.infer<typeof changePasswordSchema>

export function ChangePasswordPage() {
  const navigate = useNavigate()
  const [apiError, setApiError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ChangePasswordForm>({
    resolver: zodResolver(changePasswordSchema),
  })

  const mutation = useMutation({
    mutationFn: async (data: { currentPassword: string; newPassword: string }) => {
      const response = await auth.changePassword(data.currentPassword, data.newPassword)
      if (!response.success) {
        throw new Error(
          response.error?.[0]?.message ?? 'Falha ao alterar senha',
        )
      }
      return response.data
    },
    onSuccess: () => {
      toast.success('Senha alterada com sucesso')
      navigate('/settings/account')
    },
    onError: (error: Error) => {
      setApiError(error.message ?? 'Falha ao alterar senha')
    },
  })

  function onSubmit(data: ChangePasswordForm) {
    setApiError(null)
    mutation.mutate({
      currentPassword: data.currentPassword,
      newPassword: data.newPassword,
    })
  }

  return (
    <div className="py-6 max-w-2xl mx-auto">
      <button
        onClick={() => navigate('/settings/account')}
        className="flex items-center gap-1.5 text-text/80 hover:text-text transition-colors cursor-pointer mb-6 md:hidden"
      >
        <ArrowLeft size={20} />
        <span className="text-sm">Voltar</span>
      </button>

      <h1 className="text-xl font-bold text-text mb-2">Alterar senha</h1>
      <p className="text-sm text-text-muted mb-6">
        Após alterar a senha, todos os outros dispositivos serão deslogados. A
        sessão atual permanece ativa.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <Input
          label="Senha atual"
          type="password"
          placeholder="Digite a senha atual"
          autoComplete="current-password"
          icon={<Lock size={18} />}
          error={errors.currentPassword?.message}
          {...register('currentPassword', {
            onChange: () => apiError && setApiError(null),
          })}
        />

        <Input
          label="Nova senha"
          type="password"
          placeholder="Mínimo 8 caracteres, com maiúscula, minúscula e número"
          autoComplete="new-password"
          icon={<Lock size={18} />}
          error={errors.newPassword?.message}
          {...register('newPassword', {
            onChange: () => apiError && setApiError(null),
          })}
        />

        <Input
          label="Confirmar nova senha"
          type="password"
          placeholder="Repita a nova senha"
          autoComplete="new-password"
          icon={<Lock size={18} />}
          error={errors.confirmPassword?.message}
          {...register('confirmPassword', {
            onChange: () => apiError && setApiError(null),
          })}
        />

        {apiError && (
          <p className="mb-3 text-center text-sm text-error">
            {apiError.slice(0, 200)}
          </p>
        )}

        <div className="flex gap-3 pt-2">
          <Button
            type="button"
            variant="secondary"
            onClick={() => navigate('/settings/account')}
            disabled={mutation.isPending}
          >
            Cancelar
          </Button>
          <Button type="submit" isLoading={mutation.isPending}>
            Alterar senha
          </Button>
        </div>
      </form>
    </div>
  )
}
