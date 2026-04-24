import { useState } from 'react'
import { Link } from 'react-router'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Mail, Lock } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'

const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'Senha obrigatória'),
})

type LoginForm = z.infer<typeof loginSchema>

export function LoginPage() {
  const { signIn } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [apiError, setApiError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  })

  async function onSubmit(data: LoginForm) {
    setApiError(null)
    setIsLoading(true)
    const result = await signIn(data.email, data.password)
    setIsLoading(false)

    if (!result.success) {
      setApiError(result.error ?? 'Erro ao fazer login')
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <Input
        label="Email"
        type="email"
        placeholder="Digite seu email"
        autoComplete="email"
        icon={<Mail size={18} />}
        error={errors.email?.message}
        {...register('email', { onChange: () => apiError && setApiError(null) })}
      />

      <Input
        label="Senha"
        type="password"
        placeholder="Digite sua senha"
        autoComplete="current-password"
        icon={<Lock size={18} />}
        error={errors.password?.message}
        {...register('password', { onChange: () => apiError && setApiError(null) })}
      />

      {apiError && (
        <p className="mb-4 text-center text-sm text-error">{apiError.slice(0, 200)}</p>
      )}

      <div className="mt-2">
        <Button type="submit" isLoading={isLoading}>
          Entrar
        </Button>
      </div>

      <Link
        to="/auth/forgot-password"
        className="block mt-5 text-center text-sm text-primary hover:text-primary-light transition-colors"
      >
        Esqueci minha senha
      </Link>

      <p className="mt-8 text-center text-sm text-text-muted">
        O cadastro de novas contas esta temporariamente indisponivel.
      </p>
    </form>
  )
}
