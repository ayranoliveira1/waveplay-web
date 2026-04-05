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

export interface UserData {
  id: string
  name: string
  email: string
  subscription: UserSubscription | null
  createdAt: string
}
