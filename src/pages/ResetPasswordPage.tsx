import { useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Lock } from 'lucide-react'
import { api } from '../services/api'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'

const resetSchema = z
  .object({
    password: z.string().min(8, 'Mínimo 8 caracteres'),
    confirmPassword: z.string().min(1, 'Confirme a senha'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'As senhas não coincidem',
    path: ['confirmPassword'],
  })

type ResetForm = z.infer<typeof resetSchema>

export function ResetPasswordPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  const [apiError, setApiError] = useState<string | null>(null)

  const rawToken = searchParams.get('token')
  const token = rawToken && /^[a-zA-Z0-9._-]+$/.test(rawToken) ? rawToken : null

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetForm>({
    resolver: zodResolver(resetSchema),
  })

  async function onSubmit(data: ResetForm) {
    setApiError(null)
    setIsLoading(true)

    const response = await api.post('/auth/reset-password', {
      token,
      password: data.password,
    })

    setIsLoading(false)

    if (response.success) {
      navigate('/auth/login', { replace: true })
    } else {
      setApiError((response.error?.[0]?.message ?? 'Erro ao redefinir senha').slice(0, 200))
    }
  }

  if (!token) {
    return (
      <div className="text-center">
        <p className="text-error mb-4">Token inválido ou ausente.</p>
        <a
          href="/auth/forgot-password"
          className="text-sm text-primary hover:text-primary-light transition-colors"
        >
          Solicitar novo link
        </a>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <p className="text-sm text-text-muted mb-6 text-center">
        Defina sua nova senha.
      </p>

      <Input
        label="Nova senha"
        type="password"
        placeholder="Mínimo 8 caracteres"
        autoComplete="new-password"
        icon={<Lock size={18} />}
        error={errors.password?.message}
        {...register('password')}
      />

      <Input
        label="Confirmar senha"
        type="password"
        placeholder="Repita a senha"
        autoComplete="new-password"
        icon={<Lock size={18} />}
        error={errors.confirmPassword?.message}
        {...register('confirmPassword')}
      />

      {apiError && (
        <p className="mb-3 text-center text-sm text-error">{apiError}</p>
      )}

      <Button type="submit" isLoading={isLoading}>
        Redefinir senha
      </Button>
    </form>
  )
}
