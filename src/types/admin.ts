import type { UserRole } from './api-response'

// Tipos do bounded context do painel admin.
// Backend e autoridade final — estes shapes espelham as respostas de /admin/*.

export interface AdminUser {
  id: string
  name: string
  email: string
  role: UserRole
  createdAt: string
  profilesCount: number
  subscription: {
    id: string
    status: string
    planName: string
    planSlug: string
    endsAt: string | null
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

export interface AnalyticsOverview {
  totalUsers: number
  totalActiveSubscriptions: number
  subscriptionsByPlan: Array<{
    planName: string
    planSlug: string
    count: number
  }>
  activeStreams: number
  estimatedMonthlyRevenue: number
  profileDistribution: Array<{ count: number; users: number }>
  profilesByType: { kids: number; normal: number }
}

export interface AnalyticsPeriod {
  registrationsByDay: Array<{ date: string; count: number }>
  cumulativeUsers: Array<{ date: string; total: number }>
  activeUsers: number
  topContent: Array<{
    tmdbId: number
    title: string
    type: string
    views: number
  }>
  streamsByHour: Array<{ hour: number; count: number }>
  totalStreamSessions: number
  avgStreamDuration: number
}

export interface DashboardAnalytics {
  overview: AnalyticsOverview
  period: AnalyticsPeriod
}

export interface CreateUserRequest {
  name: string
  email: string
  password: string
  planId?: string
}

export interface AdminUserDetail {
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
    plan: {
      id: string
      name: string
      slug: string
      maxProfiles: number
      maxStreams: number
    }
  } | null
  profiles: { id: string; name: string; isKid: boolean }[]
}

export interface UpdateSubscriptionRequest {
  planId: string
  endsAt?: string | null
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
