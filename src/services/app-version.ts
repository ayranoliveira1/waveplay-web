import { api } from './api'
import type { AppVersion } from '../types/mobile-app'

// Service publico — consumido pela pagina /download (sem auth).
export const appVersionService = {
  getCurrent: () => api.get<AppVersion>('/app/version'),
}
