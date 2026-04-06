import { useState, useEffect, useCallback, type ReactNode } from 'react'
import { AuthContext, type AuthResult } from './auth-context'
import { api, setOnUnauthorized } from '../services/api'
import { setAccessToken, clearAccessToken } from '../services/token-storage'
import type { UserData } from '../types/api-response'

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<UserData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const signOut = useCallback(async () => {
    api.post('/auth/logout').catch(() => {})
    clearAccessToken()
    localStorage.removeItem('waveplay:search_history')
    setUser(null)
  }, [])

  useEffect(() => {
    async function restoreSession() {
      try {
        const refreshResponse = await api.post<{ accessToken: string }>('/auth/refresh')

        if (!refreshResponse.success || !refreshResponse.data.accessToken) {
          return
        }

        setAccessToken(refreshResponse.data.accessToken)

        const accountResponse = await api.get<{ user: UserData }>('/account')
        if (accountResponse.success) {
          setUser(accountResponse.data.user)
        } else {
          clearAccessToken()
        }
      } catch {
        clearAccessToken()
      } finally {
        setIsLoading(false)
      }
    }

    setOnUnauthorized(() => {
      clearAccessToken()
      setUser(null)
    })

    restoreSession()
  }, [])

  const signIn = useCallback(async (email: string, password: string): Promise<AuthResult> => {
    const response = await api.post<{ accessToken: string }>('/auth/login', { email, password })

    if (!response.success) {
      const message = response.error?.[0]?.message ?? ''

      if (message.toLowerCase().includes('bloqueada') || message.includes('429')) {
        return {
          success: false,
          error: 'Conta temporariamente bloqueada. Tente novamente mais tarde.',
        }
      }

      return { success: false, error: 'Credenciais inválidas' }
    }

    setAccessToken(response.data.accessToken)

    const accountResponse = await api.get<{ user: UserData }>('/account')
    if (accountResponse.success) {
      setUser(accountResponse.data.user)
    }

    return { success: true }
  }, [])

  const signUp = useCallback(
    async (name: string, email: string, password: string): Promise<AuthResult> => {
      const response = await api.post<{ accessToken: string }>('/auth/register', {
        name,
        email,
        password,
      })

      if (!response.success) {
        const message = response.error?.[0]?.message ?? 'Erro ao criar conta'
        return { success: false, error: message }
      }

      setAccessToken(response.data.accessToken)

      const accountResponse = await api.get<{ user: UserData }>('/account')
      if (accountResponse.success) {
        setUser(accountResponse.data.user)
      }

      return { success: true }
    },
    [],
  )

  return (
    <AuthContext.Provider
      value={{ user, isAuthenticated: !!user, isLoading, signIn, signUp, signOut }}
    >
      {children}
    </AuthContext.Provider>
  )
}
