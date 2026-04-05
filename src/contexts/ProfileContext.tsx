import { useState, useEffect, useCallback, type ReactNode } from 'react'
import { ProfileContext } from './profile-context'
import { useAuth } from '../hooks/useAuth'
import { api } from '../services/api'
import type { Profile } from '../types/api'

const STORAGE_KEY = 'waveplay:activeProfileId'

interface ProfileProviderProps {
  children: ReactNode
}

export function ProfileProvider({ children }: ProfileProviderProps) {
  const { user } = useAuth()
  const [activeProfile, setActiveProfile] = useState<Profile | null>(null)
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const fetchProfiles = useCallback(async () => {
    setIsLoading(true)
    try {
      const response = await api.get<{ profiles: Profile[] }>('/profiles')
      if (!response.success) return

      const fetched = response.data.profiles
      setProfiles(fetched)

      const savedId = sessionStorage.getItem(STORAGE_KEY)
      const saved = savedId ? fetched.find((p) => p.id === savedId) : null

      if (saved) {
        setActiveProfile(saved)
      } else if (fetched.length === 1 && fetched[0]) {
        setActiveProfile(fetched[0])
        sessionStorage.setItem(STORAGE_KEY, fetched[0].id)
      }
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    if (user) {
      fetchProfiles()
    } else {
      setProfiles([])
      setActiveProfile(null)
      sessionStorage.removeItem(STORAGE_KEY)
    }
  }, [user, fetchProfiles])

  const selectProfile = useCallback((profile: Profile) => {
    setActiveProfile(profile)
    sessionStorage.setItem(STORAGE_KEY, profile.id)
  }, [])

  const clearProfile = useCallback(() => {
    setActiveProfile(null)
    sessionStorage.removeItem(STORAGE_KEY)
  }, [])

  const refreshProfiles = useCallback(async () => {
    await fetchProfiles()
  }, [fetchProfiles])

  return (
    <ProfileContext.Provider
      value={{ activeProfile, profiles, isLoading, selectProfile, clearProfile, refreshProfiles }}
    >
      {children}
    </ProfileContext.Provider>
  )
}
