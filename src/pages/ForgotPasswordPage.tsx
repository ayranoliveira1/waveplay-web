import { useState } from 'react'
import { Link } from 'react-router'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Mail } from 'lucide-react'
import { api } from '../services/api'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'

const forgotSchema = z.object({
  email: z.string().email('Email inválido'),
})

type ForgotForm = z.infer<typeof forgotSchema>

export function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotForm>({
    resolver: zodResolver(forgotSchema),
  })

  async function onSubmit(data: ForgotForm) {
    setIsLoading(true)
    await api.post('/auth/forgot-password', { email: data.email })
    setIsLoading(false)
    setSent(true)
  }

  if (sent) {
    return (
      <div className="text-center">
        <p className="text-text mb-4">
          Se este email estiver cadastrado, você receberá um link para redefinir sua senha.
        </p>
        <Link
          to="/auth/login"
          className="text-sm text-primary hover:text-primary-light transition-colors"
        >
          Voltar ao login
        </Link>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <p className="text-sm text-text-muted mb-6 text-center">
        Informe seu email para receber o link de redefinição de senha.
      </p>

      <Input
        label="Email"
        type="email"
        placeholder="Digite seu email"
        autoComplete="email"
        icon={<Mail size={18} />}
        error={errors.email?.message}
        {...register('email')}
      />

      <Button type="submit" isLoading={isLoading}>
        Enviar link de reset
      </Button>

      <Link
        to="/auth/login"
        className="block mt-4 text-center text-sm text-primary hover:text-primary-light transition-colors"
      >
        Voltar ao login
      </Link>
    </form>
  )
}
