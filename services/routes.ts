import apiInstance from '@/lib/api'
import { Route, RoutesResponse, RouteCreateData, RouteUpdateData } from '@/lib/types'

export const routeService = {
  getRoutes: async (
    page: number = 1,
    search?: string,
    is_active?: boolean
  ): Promise<RoutesResponse> => {
    let endpoint = `booking/routes/?page=${page}`
    if (search) {
      endpoint += `&search=${encodeURIComponent(search)}`
    }
    if (is_active !== undefined) {
      endpoint += `&is_active=${is_active}`
    }
    const response = await apiInstance.get(endpoint)
    return response.data
  },

  getRoute: async (id: string): Promise<{ success: boolean; message: string; route: Route }> => {
    const response = await apiInstance.get(`booking/routes/${id}/`)
    return response.data
  },

  createRoute: async (routeData: RouteCreateData): Promise<{ success: boolean; message: string; route: Route }> => {
    const response = await apiInstance.post('booking/routes/', routeData)
    return response.data
  },

  updateRoute: async (id: string, routeData: RouteCreateData): Promise<{ success: boolean; message: string; route: Route }> => {
    const response = await apiInstance.put(`booking/routes/${id}/`, routeData)
    return response.data
  },

  patchRoute: async (id: string, routeData: RouteUpdateData): Promise<{ success: boolean; message: string; route: Route }> => {
    const response = await apiInstance.patch(`booking/routes/${id}/`, routeData)
    return response.data
  },

  deleteRoute: async (id: string): Promise<{ success: boolean; message: string }> => {
    const response = await apiInstance.delete(`booking/routes/${id}/`)
    return response.data
  }
}
