import { createContext } from 'react'
import type { Profile } from '../types/api'

export interface ProfileContextType {
  activeProfile: Profile | null
  profiles: Profile[]
  isLoading: boolean
  selectProfile: (profile: Profile) => void
  clearProfile: () => void
  refreshProfiles: () => Promise<void>
}

export const ProfileContext = createContext<ProfileContextType | null>(null)
