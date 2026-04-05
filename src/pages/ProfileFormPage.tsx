import { useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { api } from '../services/api'
import { useProfile } from '../hooks/useProfile'
import { PROFILE_COLORS, getInitials } from '../constants/theme'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'

const profileSchema = z.object({
  name: z.string().min(1, 'Nome obrigatório').max(50, 'Máximo 50 caracteres'),
  isKid: z.boolean(),
})

type ProfileForm = z.infer<typeof profileSchema>

export function ProfileFormPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { profiles, activeProfile, clearProfile, refreshProfiles } = useProfile()

  const isEditing = !!id
  const existingProfile = isEditing ? profiles.find((p) => p.id === id) : null
  const profileIndex = isEditing
    ? profiles.findIndex((p) => p.id === id)
    : profiles.length
  const profileColor = PROFILE_COLORS[
    (profileIndex >= 0 ? profileIndex : 0) % PROFILE_COLORS.length
  ]

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [apiError, setApiError] = useState<string | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [previewName, setPreviewName] = useState(existingProfile?.name ?? '')

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: existingProfile?.name ?? '',
      isKid: existingProfile?.isKid ?? false,
    },
  })

  async function onSubmit(data: ProfileForm) {
    setApiError(null)
    setIsSubmitting(true)

    const body = { name: data.name, isKid: data.isKid }

    const response = isEditing
      ? await api.put(`/profiles/${id}`, body)
      : await api.post('/profiles', body)

    setIsSubmitting(false)

    if (!response.success) {
      const message = response.error?.[0]?.message ?? 'Erro ao salvar perfil'
      setApiError(message)
      return
    }

    await refreshProfiles()
    navigate('/profiles')
  }

  async function handleDelete() {
    if (!id) return
    setIsDeleting(true)

    const response = await api.delete(`/profiles/${id}`)

    setIsDeleting(false)

    if (!response.success) {
      const message = response.error?.[0]?.message ?? 'Erro ao excluir perfil'
      setApiError(message)
      setShowDeleteConfirm(false)
      return
    }

    if (activeProfile?.id === id) {
      clearProfile()
    }

    await refreshProfiles()
    navigate('/profiles')
  }

  const canDelete = isEditing && profiles.length > 1

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm sm:max-w-md">
        <h1 className="text-2xl sm:text-3xl font-bold text-text text-center mb-2">
          {isEditing ? 'Editar perfil' : 'Novo perfil'}
        </h1>
        <p className="text-text-muted text-sm text-center mb-8">
          {profiles.length} perfis
        </p>

        {/* Avatar preview */}
        <div className="flex justify-center mb-8">
          <div
            className="h-24 w-24 sm:h-32 sm:w-32 rounded-full flex items-center justify-center text-3xl sm:text-4xl font-bold text-text"
            style={{ backgroundColor: profileColor }}
          >
            {previewName ? getInitials(previewName) : '?'}
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <Input
            label="Nome do perfil"
            type="text"
            placeholder="Ex: João, Maria..."
            autoComplete="off"
            error={errors.name?.message}
            {...register('name', {
              onChange: (e) => {
                setPreviewName(e.target.value)
                if (apiError) setApiError(null)
              },
            })}
          />

          <div className="mb-6 flex items-center justify-between rounded-lg bg-surface px-4 py-3">
            <div>
              <span className="text-sm font-medium text-text">Perfil infantil</span>
              <p className="text-xs text-text-muted">Conteúdo filtrado para crianças</p>
            </div>
            <input
              type="checkbox"
              className="h-5 w-5 rounded border-border bg-surface accent-primary cursor-pointer"
              {...register('isKid')}
            />
          </div>

          {apiError && (
            <p className="mb-4 text-center text-sm text-error">{apiError}</p>
          )}

          <div className="flex flex-col gap-3 mt-4">
            <Button type="submit" isLoading={isSubmitting}>
              {isEditing ? 'Salvar' : 'Criar perfil'}
            </Button>

            {canDelete && !showDeleteConfirm && (
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowDeleteConfirm(true)}
              >
                Excluir perfil
              </Button>
            )}

            {showDeleteConfirm && (
              <div className="rounded-lg border border-error/30 bg-error/10 p-4 text-center">
                <p className="text-sm text-text mb-3">
                  Tem certeza? Todos os dados deste perfil (favoritos, histórico, progresso) serão
                  perdidos.
                </p>
                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowDeleteConfirm(false)}
                  >
                    Cancelar
                  </Button>
                  <button
                    type="button"
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="h-12 flex-1 rounded-lg bg-error font-semibold text-sm text-text transition-colors hover:bg-error/80 disabled:opacity-50 cursor-pointer"
                  >
                    {isDeleting ? 'Excluindo...' : 'Confirmar exclusão'}
                  </button>
                </div>
              </div>
            )}

            <button
              type="button"
              onClick={() => navigate('/profiles')}
              className="h-12 text-sm text-primary hover:text-primary-light transition-colors cursor-pointer"
            >
              Voltar
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
