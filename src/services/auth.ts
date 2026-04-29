import { api } from './api'

export const auth = {
  changePassword: (currentPassword: string, newPassword: string) =>
    api.patch<{ message: string }>('/auth/password', {
      currentPassword,
      newPassword,
    }),
}
