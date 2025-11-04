import apiInstance from '@/lib/api'
import { LuggageType, LuggageTypesResponse, LuggageTypeCreateData, LuggageTypeUpdateData } from '@/lib/types'

export const luggageService = {
  getLuggageTypes: async (
    page: number = 1,
    search?: string,
    is_active?: boolean
  ): Promise<LuggageTypesResponse> => {
    let endpoint = `booking/luggage-types/?page=${page}`
    if (search) {
      endpoint += `&search=${encodeURIComponent(search)}`
    }
    if (is_active !== undefined) {
      endpoint += `&is_active=${is_active}`
    }
    const response = await apiInstance.get(endpoint)
    return response.data
  },

  getLuggageType: async (id: string): Promise<{ success: boolean; message: string; luggage_type: LuggageType }> => {
    const response = await apiInstance.get(`booking/luggage-types/${id}/`)
    return response.data
  },

  createLuggageType: async (data: LuggageTypeCreateData): Promise<{ success: boolean; message: string; luggage_type: LuggageType }> => {
    const response = await apiInstance.post('booking/luggage-types/', data)
    return response.data
  },

  updateLuggageType: async (id: string, data: LuggageTypeUpdateData): Promise<{ success: boolean; message: string; luggage_type: LuggageType }> => {
    const response = await apiInstance.put(`booking/luggage-types/${id}/`, data)
    return response.data
  },

  partialUpdateLuggageType: async (id: string, data: LuggageTypeUpdateData): Promise<{ success: boolean; message: string; luggage_type: LuggageType }> => {
    const response = await apiInstance.patch(`booking/luggage-types/${id}/`, data)
    return response.data
  },

  deleteLuggageType: async (id: string): Promise<{ success: boolean; message: string }> => {
    const response = await apiInstance.delete(`booking/luggage-types/${id}/`)
    return response.data
  }
}
