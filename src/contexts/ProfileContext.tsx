import { useState, useEffect, useCallback, type ReactNode } from 'react'
import { ProfileContext } from './profile-context'
import { useAuth } from '../hooks/useAuth'
import { api } from '../services/api'
import type { Profile } from '../types/api'

const STORAGE_KEY = 'waveplay:activeProfile'
const PROFILE_TTL = 4 * 60 * 60 * 1000 // 4 horas

function getSavedProfileId(): string | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as { id: string; expiresAt: number }
    if (Date.now() > parsed.expiresAt) {
      localStorage.removeItem(STORAGE_KEY)
      return null
    }
    return parsed.id
  } catch {
    localStorage.removeItem(STORAGE_KEY)
    return null
  }
}

function saveProfileId(id: string) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ id, expiresAt: Date.now() + PROFILE_TTL }))
}

function removeProfileId() {
  localStorage.removeItem(STORAGE_KEY)
}

interface ProfileProviderProps {
  children: ReactNode
}

export function ProfileProvider({ children }: ProfileProviderProps) {
  const { user, isLoading: authLoading } = useAuth()
  const [activeProfile, setActiveProfile] = useState<Profile | null>(null)
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [isFetching, setIsFetching] = useState(false)
  const [hasFetched, setHasFetched] = useState(false)

  const isLoading = authLoading || isFetching || (!!user && !hasFetched)

  const fetchProfiles = useCallback(async () => {
    setIsFetching(true)
    try {
      const response = await api.get<{ profiles: Profile[] }>('/profiles')
      if (!response.success) return

      const fetched = response.data.profiles
      setProfiles(fetched)

      const savedId = getSavedProfileId()
      const saved = savedId ? fetched.find((p) => p.id === savedId) : null

      if (saved) {
        setActiveProfile(saved)
      } else if (fetched.length === 1 && fetched[0]) {
        setActiveProfile(fetched[0])
        saveProfileId(fetched[0].id)
      }
    } finally {
      setIsFetching(false)
      setHasFetched(true)
    }
  }, [])

  useEffect(() => {
    if (authLoading) return

    if (user) {
      fetchProfiles()
    } else {
      setProfiles([])
      setActiveProfile(null)
      setHasFetched(false)
      removeProfileId()
    }
  }, [user, authLoading, fetchProfiles])

  const selectProfile = useCallback((profile: Profile) => {
    setActiveProfile(profile)
    saveProfileId(profile.id)
  }, [])

  const clearProfile = useCallback(() => {
    setActiveProfile(null)
    removeProfileId()
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
