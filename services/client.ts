import apiInstance from '@/lib/api'
import { ClientsResponse, StatsResponse } from '@/lib/types'

export const clientService = {
  getClients: async (page: number = 1, search?: string): Promise<ClientsResponse> => {
    let endpoint = `auth/admin/clients/?page=${page}`
    if (search) {
      endpoint += `&search=${encodeURIComponent(search)}`
    }
    const response = await apiInstance.get(endpoint)
    return response.data
  },

  getStats: async (): Promise<StatsResponse> => {
    const response = await apiInstance.get('auth/admin/stats/')
    return response.data
  }
}