import { createContext, useState, type ReactNode } from 'react'
import type { UserData } from '../types/api-response'

export interface AuthContextType {
  user: UserData | null
  isAuthenticated: boolean
  isLoading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (name: string, email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
}

export const AuthContext = createContext<AuthContextType | null>(null)

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user] = useState<UserData | null>(null)
  const [isLoading] = useState(false)

  const isAuthenticated = user !== null

  async function signIn(_email: string, _password: string) {
    // TODO: Task 04 — implementar
  }

  async function signUp(_name: string, _email: string, _password: string) {
    // TODO: Task 04 — implementar
  }

  async function signOut() {
    // TODO: Task 04 — implementar
  }

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, isLoading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}
