import { useState, type ReactNode } from 'react'
import { ProfileContext } from './profile-context'
import type { Profile } from '../types/api'

interface ProfileProviderProps {
  children: ReactNode
}

export function ProfileProvider({ children }: ProfileProviderProps) {
  const [activeProfile] = useState<Profile | null>(null)
  const [profiles] = useState<Profile[]>([])
  const [isLoading] = useState(false)

  function selectProfile(_: Profile) {
    void _
    // TODO: Task 05 — implementar
  }

  function clearProfile() {
    // TODO: Task 05 — implementar
  }

  async function refreshProfiles() {
    // TODO: Task 05 — implementar
  }

  return (
    <ProfileContext.Provider
      value={{ activeProfile, profiles, isLoading, selectProfile, clearProfile, refreshProfiles }}
    >
      {children}
    </ProfileContext.Provider>
  )
}
