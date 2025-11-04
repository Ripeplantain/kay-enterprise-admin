import apiInstance from '@/lib/api'
import { Trip, TripsResponse, TripCreateData, TripUpdateData, TripSeatsResponse } from '@/lib/types'

interface TripFilters {
  page?: number
  status?: string
  route?: string
  origin?: string
  destination?: string
  start_date?: string
  end_date?: string
  search?: string
}

export const tripService = {
  getTrips: async (filters?: TripFilters): Promise<TripsResponse> => {
    let endpoint = `booking/trips/?page=${filters?.page || 1}`

    if (filters?.status) {
      endpoint += `&status=${encodeURIComponent(filters.status)}`
    }
    if (filters?.route) {
      endpoint += `&route=${encodeURIComponent(filters.route)}`
    }
    if (filters?.origin) {
      endpoint += `&origin=${encodeURIComponent(filters.origin)}`
    }
    if (filters?.destination) {
      endpoint += `&destination=${encodeURIComponent(filters.destination)}`
    }
    if (filters?.start_date) {
      endpoint += `&start_date=${encodeURIComponent(filters.start_date)}`
    }
    if (filters?.end_date) {
      endpoint += `&end_date=${encodeURIComponent(filters.end_date)}`
    }
    if (filters?.search) {
      endpoint += `&search=${encodeURIComponent(filters.search)}`
    }

    const response = await apiInstance.get(endpoint)
    return response.data
  },

  getTrip: async (id: string): Promise<{ success: boolean; message: string; trip: Trip }> => {
    const response = await apiInstance.get(`booking/trips/${id}/`)
    return response.data
  },

  getTripSeats: async (id: string): Promise<TripSeatsResponse> => {
    const response = await apiInstance.get(`booking/trips/${id}/seats/`)
    return response.data
  },

  createTrip: async (tripData: TripCreateData): Promise<{ success: boolean; message: string; trip: Trip }> => {
    const response = await apiInstance.post('booking/trips/', tripData)
    return response.data
  },

  updateTrip: async (id: string, tripData: TripCreateData): Promise<{ success: boolean; message: string; trip: Trip }> => {
    const response = await apiInstance.put(`booking/trips/${id}/`, tripData)
    return response.data
  },

  patchTrip: async (id: string, tripData: TripUpdateData): Promise<{ success: boolean; message: string; trip: Trip }> => {
    const response = await apiInstance.patch(`booking/trips/${id}/`, tripData)
    return response.data
  },

  deleteTrip: async (id: string): Promise<{ success: boolean; message: string }> => {
    const response = await apiInstance.delete(`booking/trips/${id}/`)
    return response.data
  }
}
