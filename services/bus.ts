import apiInstance from '@/lib/api'
import { Bus, BusesResponse } from '@/lib/types'

export const busService = {
  getBuses: async (
    page: number = 1,
    search?: string,
    bus_type?: string,
    is_active?: boolean
  ): Promise<BusesResponse> => {
    let endpoint = `booking/buses/?page=${page}`
    if (search) {
      endpoint += `&search=${encodeURIComponent(search)}`
    }
    if (bus_type) {
      endpoint += `&bus_type=${encodeURIComponent(bus_type)}`
    }
    if (is_active !== undefined) {
      endpoint += `&is_active=${is_active}`
    }
    const response = await apiInstance.get(endpoint)
    return response.data
  },

  getBus: async (id: string): Promise<{ success: boolean; message: string; bus: Bus }> => {
    const response = await apiInstance.get(`booking/buses/${id}/`)
    return response.data
  },

  createBus: async (busData: Partial<Bus>): Promise<{ success: boolean; message: string; bus: Bus }> => {
    const response = await apiInstance.post('booking/buses/', busData)
    return response.data
  },

  updateBus: async (id: string, busData: Partial<Bus>): Promise<{ success: boolean; message: string; bus: Bus }> => {
    const response = await apiInstance.put(`booking/buses/${id}/`, busData)
    return response.data
  },

  deleteBus: async (id: string): Promise<{ success: boolean; message: string }> => {
    const response = await apiInstance.delete(`booking/buses/${id}/`)
    return response.data
  },

  getAvailableBuses: async (): Promise<Bus[]> => {
    const response = await apiInstance.get('booking/buses/available/')
    return response.data
  }
}