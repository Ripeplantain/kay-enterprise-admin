import apiInstance from '@/lib/api'

export const authService = {
  login: async (username: string, password: string) => {
    const response = await apiInstance.post('auth/admin/login/', {
      username,
      password
    })
    return response.data
  },

  refreshToken: async (refreshToken: string) => {
    const response = await apiInstance.post('auth/refresh/', {
      refresh: refreshToken
    })
    return response.data
  }
}