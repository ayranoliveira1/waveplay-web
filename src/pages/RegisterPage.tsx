import { useState } from 'react'
import { Link } from 'react-router'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { User, Mail, Lock } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'

const registerSchema = z.object({
  name: z.string().min(1, 'Nome obrigatório').max(255),
  email: z.string().email('Email inválido'),
  password: z.string().min(8, 'Mínimo 8 caracteres'),
})

type RegisterForm = z.infer<typeof registerSchema>

export function RegisterPage() {
  const { signUp } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [apiError, setApiError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  })

  async function onSubmit(data: RegisterForm) {
    setApiError(null)
    setIsLoading(true)
    const result = await signUp(data.name, data.email, data.password)
    setIsLoading(false)

    if (!result.success) {
      setApiError(result.error ?? 'Erro ao criar conta')
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <Input
        label="Nome"
        type="text"
        placeholder="Digite seu nome"
        autoComplete="name"
        icon={<User size={18} />}
        error={errors.name?.message}
        {...register('name', { onChange: () => apiError && setApiError(null) })}
      />

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
        placeholder="Mínimo 8 caracteres"
        autoComplete="new-password"
        icon={<Lock size={18} />}
        error={errors.password?.message}
        {...register('password', { onChange: () => apiError && setApiError(null) })}
      />

      {apiError && (
        <p className="mb-4 text-center text-sm text-error">{apiError}</p>
      )}

      <div className="mt-2">
        <Button type="submit" isLoading={isLoading}>
          Criar conta
        </Button>
      </div>

      <p className="mt-8 text-center text-sm text-text-muted">
        Já tem conta?{' '}
        <Link to="/auth/login" className="font-semibold text-primary hover:text-primary-light transition-colors">
          Entrar
        </Link>
      </p>
    </form>
  )
}
