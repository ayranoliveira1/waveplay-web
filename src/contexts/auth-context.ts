import { createContext } from 'react'
import type { UserData } from '../types/api-response'

export interface AuthResult {
  success: boolean
  error?: string
}

export interface AuthContextType {
  user: UserData | null
  isAuthenticated: boolean
  isLoading: boolean
  signIn: (email: string, password: string) => Promise<AuthResult>
  signUp: (name: string, email: string, password: string) => Promise<AuthResult>
  signOut: () => Promise<void>
}

export const AuthContext = createContext<AuthContextType | null>(null)
