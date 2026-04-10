import type { UserRole } from './api-response'

// Tipos do bounded context do painel admin.
// Backend e autoridade final — estes shapes espelham as respostas de /admin/*.

export interface AdminUser {
  id: string
  name: string
  email: string
  role: UserRole
  createdAt: string
  subscription: {
    id: string
    status: string
    startedAt: string
    endsAt: string | null
    plan: { id: string; name: string; slug: string }
  } | null
}

export interface AdminPlan {
  id: string
  name: string
  slug: string
  priceCents: number
  maxProfiles: number
  maxStreams: number
  description: string
  active: boolean
}

export interface DashboardAnalytics {
  totalUsers: number
  totalActiveSubscriptions: number
  totalPlans: number
  newUsersLast30Days: number
  usersByPlan: Array<{ planId: string; planName: string; userCount: number }>
}

export interface CreateUserRequest {
  name: string
  email: string
  password: string
  planId?: string
}

export interface UpdateSubscriptionRequest {
  planId: string
}

export interface CreatePlanRequest {
  name: string
  slug: string
  priceCents: number
  maxProfiles: number
  maxStreams: number
  description: string
}

// Slug e imutavel por business rule — garantido via Omit no tipo.
export type UpdatePlanRequest = Partial<Omit<CreatePlanRequest, 'slug'>>
