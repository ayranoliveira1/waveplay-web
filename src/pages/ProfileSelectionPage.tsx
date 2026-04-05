import { useState } from 'react'
import { useNavigate } from 'react-router'
import { Pencil, Plus } from 'lucide-react'
import { useProfile } from '../hooks/useProfile'
import { useAuth } from '../hooks/useAuth'
import { PROFILE_COLORS, getInitials } from '../constants/theme'
import { Button } from '../components/ui/Button'

export function ProfileSelectionPage() {
  const navigate = useNavigate()
  const { profiles, selectProfile, isLoading } = useProfile()
  const { user } = useAuth()
  const [editMode, setEditMode] = useState(false)

  const maxProfiles = user?.subscription?.plan?.maxProfiles ?? 1
  const canAdd = profiles.length < maxProfiles

  function handleProfileClick(profile: (typeof profiles)[number]) {
    if (editMode) {
      navigate(`/profiles/${profile.id}/edit`)
    } else {
      selectProfile(profile)
      navigate('/browse')
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4">
      <h1 className="text-2xl sm:text-3xl font-bold text-text mb-2">
        Quem está assistindo?
      </h1>
      <p className="text-text-muted text-sm mb-10">
        Selecione um perfil para continuar
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6 sm:gap-8 mb-10">
        {profiles.map((profile, index) => (
          <button
            key={profile.id}
            onClick={() => handleProfileClick(profile)}
            className="group flex flex-col items-center gap-3 cursor-pointer"
          >
            <div className="relative">
              <div
                className="h-20 w-20 sm:h-28 sm:w-28 rounded-full flex items-center justify-center text-2xl sm:text-3xl font-bold text-text transition-transform group-hover:scale-105 group-hover:ring-2 group-hover:ring-text/50"
                style={{ backgroundColor: PROFILE_COLORS[index % PROFILE_COLORS.length] }}
              >
                {getInitials(profile.name)}
              </div>
              {editMode && (
                <div className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center">
                  <Pencil size={24} className="text-text" />
                </div>
              )}
              {profile.isKid && (
                <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-warning text-background text-[10px] font-bold px-2 py-0.5 rounded-full">
                  Infantil
                </span>
              )}
            </div>
            <span className="text-sm text-text-muted group-hover:text-text transition-colors">
              {profile.name}
            </span>
          </button>
        ))}

        {canAdd && (
          <button
            onClick={() => navigate('/profiles/new')}
            className="group flex flex-col items-center gap-3 cursor-pointer"
          >
            <div className="h-20 w-20 sm:h-28 sm:w-28 rounded-full border-2 border-dashed border-border flex items-center justify-center transition-colors group-hover:border-text-muted">
              <Plus size={32} className="text-text-muted group-hover:text-text transition-colors" />
            </div>
            <span className="text-sm text-text-muted group-hover:text-text transition-colors">
              Adicionar
            </span>
          </button>
        )}
      </div>

      <p className="text-xs text-text-muted mb-6">
        {profiles.length}/{maxProfiles} perfis
      </p>

      <div className="w-48">
        <Button
          variant={editMode ? 'primary' : 'outline'}
          onClick={() => setEditMode(!editMode)}
        >
          {editMode ? 'Concluído' : 'Gerenciar perfis'}
        </Button>
      </div>
    </div>
  )
}
