import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { z } from 'zod'
import { admin } from '../../../services/admin'
import { Modal } from '../../../components/ui/Modal'
import { Input } from '../../../components/ui/Input'
import { Button } from '../../../components/ui/Button'
import { toast } from '../../../lib/toast'

interface EditableUser {
  id: string
  name: string
  email: string
}

const editUserSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'Nome deve ter no minimo 2 caracteres')
    .max(120)
    .optional()
    .or(z.literal('')),
  email: z
    .string()
    .trim()
    .email('Email invalido')
    .max(255)
    .optional()
    .or(z.literal('')),
})

type EditUserFormData = z.infer<typeof editUserSchema>

interface EditUserModalProps {
  open: boolean
  onClose: () => void
  user: EditableUser | null
}

export function EditUserModal({ open, onClose, user }: EditUserModalProps) {
  if (!user) return null

  return (
    <Modal open={open} onClose={onClose} title="Editar usuario">
      <EditUserForm key={user.id} user={user} onClose={onClose} />
    </Modal>
  )
}

interface EditUserFormProps {
  user: EditableUser
  onClose: () => void
}

function EditUserForm({ user, onClose }: EditUserFormProps) {
  const queryClient = useQueryClient()
  const [emailError, setEmailError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<EditUserFormData>({
    resolver: zodResolver(editUserSchema),
    defaultValues: {
      name: user.name,
      email: user.email,
    },
  })

  const updateMutation = useMutation({
    mutationFn: async (data: { name?: string; email?: string }) => {
      const response = await admin.updateUser(user.id, data)
      if (!response.success) {
        throw new Error(
          response.error?.[0]?.message ?? 'Falha ao atualizar usuario',
        )
      }
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] })
      queryClient.invalidateQueries({ queryKey: ['admin', 'users', user.id] })
      queryClient.invalidateQueries({ queryKey: ['admin', 'dashboard'] })
      toast.success('Usuario atualizado com sucesso')
      onClose()
    },
    onError: (error: Error) => {
      const msg = error.message ?? 'Falha ao atualizar usuario'
      if (/email/i.test(msg) && /(ja|exist|uso)/i.test(msg)) {
        setEmailError(msg)
      } else {
        toast.error(msg)
      }
    },
  })

  function onSubmit(data: EditUserFormData) {
    setEmailError(null)

    const diff: { name?: string; email?: string } = {}
    const newName = data.name?.trim()
    const newEmail = data.email?.trim()

    if (newName && newName !== user.name) diff.name = newName
    if (newEmail && newEmail !== user.email) diff.email = newEmail

    if (!diff.name && !diff.email) {
      onClose()
      return
    }

    updateMutation.mutate(diff)
  }

  function handleClose() {
    if (!updateMutation.isPending) onClose()
  }

  return (
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
        error={emailError ?? errors.email?.message}
        {...register('email')}
      />

      <div className="flex gap-3 pt-4">
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
  )
}
