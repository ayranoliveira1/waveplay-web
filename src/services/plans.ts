import { api } from './api'
import type { Plan } from '../types/api'

export const plans = {
  getPlans: () => api.get<{ plans: Plan[] }>('/plans'),
}
