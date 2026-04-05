import { API_BASE_URL } from '../constants/api'
import type { ApiResponse } from '../types/api-response'
import { getAccessToken, setAccessToken, clearAccessToken } from './token-storage'

let onUnauthorized: (() => void) | null = null
let refreshPromise: Promise<boolean> | null = null

const AUTH_PATHS = ['/auth/login', '/auth/register', '/auth/refresh']

export function setOnUnauthorized(callback: () => void) {
  onUnauthorized = callback
}

async function refreshTokens(): Promise<boolean> {
  if (refreshPromise) return refreshPromise

  refreshPromise = (async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      })

      if (!response.ok) return false

      const json = (await response.json()) as ApiResponse<{
        accessToken: string
      }>

      if (!json.success || !json.data.accessToken) return false

      setAccessToken(json.data.accessToken)
      return true
    } catch {
      return false
    }
  })()

  const result = await refreshPromise
  refreshPromise = null
  return result
}

async function request<T>(
  method: string,
  path: string,
  body?: unknown,
): Promise<ApiResponse<T>> {
  const accessToken = getAccessToken()

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }

  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`
  }

  const config: RequestInit = {
    method,
    headers,
    credentials: 'include',
  }

  if (body !== undefined) {
    config.body = JSON.stringify(body)
  }

  let response = await fetch(`${API_BASE_URL}${path}`, config)

  if (response.status === 401 && !AUTH_PATHS.some((p) => path.startsWith(p))) {
    const refreshed = await refreshTokens()

    if (refreshed) {
      const newToken = getAccessToken()
      headers['Authorization'] = `Bearer ${newToken}`
      config.headers = headers
      response = await fetch(`${API_BASE_URL}${path}`, config)
    } else {
      clearAccessToken()
      onUnauthorized?.()
      return {
        success: false,
        data: [] as unknown as T,
        error: [{ message: 'Sessao expirada' }],
      }
    }
  }

  const json = (await response.json()) as ApiResponse<T>
  return json
}

export const api = {
  get: <T>(path: string) => request<T>('GET', path),
  post: <T>(path: string, body?: unknown) => request<T>('POST', path, body),
  put: <T>(path: string, body?: unknown) => request<T>('PUT', path, body),
  patch: <T>(path: string, body?: unknown) => request<T>('PATCH', path, body),
  delete: <T>(path: string) => request<T>('DELETE', path),
}
