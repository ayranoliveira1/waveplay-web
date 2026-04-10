import { api } from './api'
import type {
  AdminUser,
  AdminPlan,
  DashboardAnalytics,
  CreateUserRequest,
  UpdateSubscriptionRequest,
  CreatePlanRequest,
  UpdatePlanRequest,
} from '../types/admin'

// Wrapper thin sobre os 8 endpoints /admin/*.
// IMPORTANTE: nenhum metodo aceita `role` no body — backend e autoridade.
// updatePlan tambem nao aceita `slug` (imutavel, enforcado via tipo).
export const admin = {
  getDashboardAnalytics: (params?: { startDate?: string; endDate?: string }) => {
    const query = new URLSearchParams()
    if (params?.startDate) query.set('startDate', params.startDate)
    if (params?.endDate) query.set('endDate', params.endDate)
    const qs = query.toString()
    return api.get<DashboardAnalytics>(
      `/admin/analytics${qs ? `?${qs}` : ''}`,
    )
  },

  listUsers: (params?: { page?: number; limit?: number; search?: string }) => {
    const query = new URLSearchParams()
    if (params?.page) query.set('page', String(params.page))
    if (params?.limit) query.set('limit', String(params.limit))
    if (params?.search) query.set('search', params.search)
    const qs = query.toString()
    return api.get<{ users: AdminUser[]; page: number; totalItems: number; totalPages: number }>(
      `/admin/users${qs ? `?${qs}` : ''}`,
    )
  },

  getUserDetail: (id: string) =>
    api.get<{ user: AdminUser }>(`/admin/users/${id}`),

  createUser: (body: CreateUserRequest) =>
    api.post<{ user: AdminUser }>('/admin/users', body),

  updateUserSubscription: (id: string, body: UpdateSubscriptionRequest) =>
    api.patch<{ user: AdminUser; warning?: string }>(
      `/admin/users/${id}/subscription`,
      body,
    ),

  createPlan: (body: CreatePlanRequest) =>
    api.post<{ plan: AdminPlan }>('/admin/plans', body),

  updatePlan: (id: string, body: UpdatePlanRequest) =>
    api.patch<{ plan: AdminPlan }>(`/admin/plans/${id}`, body),

  togglePlanActive: (id: string) =>
    api.patch<{ plan: AdminPlan }>(`/admin/plans/${id}/toggle`),
}
