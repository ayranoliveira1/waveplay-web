import { api } from './api'
import type {
  AdminUser,
  AdminUserDetail,
  AdminPlan,
  DashboardAnalytics,
  CreateUserRequest,
  UpdateUserRequest,
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
    api.get<AdminUserDetail>(`/admin/users/${id}`),

  createUser: (body: CreateUserRequest) =>
    api.post<{ user: AdminUser }>('/admin/users', body),

  updateUser: (id: string, body: UpdateUserRequest) =>
    api.patch<{ user: AdminUser }>(`/admin/users/${id}`, body),

  deactivateUser: (id: string) =>
    api.patch<{ user: AdminUser }>(`/admin/users/${id}/deactivate`),

  activateUser: (id: string) =>
    api.patch<{ user: AdminUser }>(`/admin/users/${id}/activate`),

  deleteUser: (id: string) =>
    api.delete<void>(`/admin/users/${id}`),

  cancelUserSubscription: (userId: string) =>
    api.delete<{ subscription: { id: string; status: string; planId: string; startedAt: string; endsAt: string | null } }>(
      `/admin/users/${userId}/subscription`,
    ),

  updateUserSubscription: (id: string, body: UpdateSubscriptionRequest) =>
    api.patch<{ subscription: { id: string; status: string; planId: string; startedAt: string; endsAt: string | null }; warning: string | null }>(
      `/admin/users/${id}/subscription`,
      body,
    ),

  listPlans: () => api.get<{ plans: AdminPlan[] }>('/admin/plans'),

  createPlan: (body: CreatePlanRequest) =>
    api.post<{ plan: AdminPlan }>('/admin/plans', body),

  updatePlan: (id: string, body: UpdatePlanRequest) =>
    api.patch<{ plan: AdminPlan }>(`/admin/plans/${id}`, body),

  togglePlanActive: (id: string) =>
    api.patch<{ plan: AdminPlan }>(`/admin/plans/${id}/toggle`),

  deletePlan: (id: string) => api.delete<void>(`/admin/plans/${id}`),
}
