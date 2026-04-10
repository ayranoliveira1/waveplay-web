export interface ApiResponse<T> {
  success: boolean
  data: T
  error: ApiError[] | null
}

export interface ApiError {
  message: string
  code?: string
}

export interface AuthTokens {
  accessToken: string
}

export interface UserPlan {
  id: string
  name: string
  slug: string
  maxProfiles: number
  maxStreams: number
}

export interface UserSubscription {
  id: string
  status: string
  startedAt: string
  endsAt: string | null
  plan: UserPlan
}

// Papel do usuario — backend e autoridade final. Cliente usa apenas para UX.
export type UserRole = 'user' | 'admin'

export interface UserData {
  id: string
  name: string
  email: string
  role: UserRole
  subscription: UserSubscription | null
  createdAt: string
}
