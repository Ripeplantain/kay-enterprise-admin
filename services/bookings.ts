import apiInstance from "@/lib/api"
import { BookingsResponse, Booking, BookingCreateData, BookingUpdateData, BookingStats } from "@/lib/types"

interface BookingFilters {
  page?: number
  search?: string
  status?: string
  start_date?: string
  end_date?: string
}

export const bookingService = {
  // List all bookings (admin sees all, client sees their own)
  getBookings: async (filters?: BookingFilters): Promise<BookingsResponse> => {
    let endpoint = `booking/bookings/?page=${filters?.page || 1}`

    if (filters?.search) {
      endpoint += `&search=${encodeURIComponent(filters.search)}`
    }
    if (filters?.status) {
      endpoint += `&status=${encodeURIComponent(filters.status)}`
    }
    if (filters?.start_date) {
      endpoint += `&start_date=${filters.start_date}`
    }
    if (filters?.end_date) {
      endpoint += `&end_date=${filters.end_date}`
    }

    const response = await apiInstance.get(endpoint)
    return response.data
  },

  // Get single booking by ID
  getBooking: async (id: string): Promise<{ success: boolean; message: string; booking: Booking }> => {
    const response = await apiInstance.get(`booking/bookings/${id}/`)
    return response.data
  },

  // Create new booking
  createBooking: async (data: BookingCreateData): Promise<{ success: boolean; message: string; booking: Booking }> => {
    const response = await apiInstance.post('booking/bookings/', data)
    return response.data
  },

  // Update booking (PUT)
  updateBooking: async (id: string, data: BookingCreateData): Promise<{ success: boolean; message: string; booking: Booking }> => {
    const response = await apiInstance.put(`booking/bookings/${id}/`, data)
    return response.data
  },

  // Partial update booking (PATCH)
  patchBooking: async (id: string, data: BookingUpdateData): Promise<{ success: boolean; message: string; booking: Booking }> => {
    const response = await apiInstance.patch(`booking/bookings/${id}/`, data)
    return response.data
  },

  // Cancel booking (POST to /cancel/)
  cancelBooking: async (id: string): Promise<{ success: boolean; message: string }> => {
    const response = await apiInstance.post(`booking/bookings/${id}/cancel/`)
    return response.data
  },



  getBookingStats: async (filters?: { start_date?: string, end_date?: string }): Promise<BookingStats> => {
    let endpoint = `booking/bookings/stats/`
    const params = new URLSearchParams()
    if (filters?.start_date) {
      params.append('start_date', filters.start_date)
    }
    if (filters?.end_date) {
      params.append('end_date', filters.end_date)
    }
    const queryString = params.toString()
    if (queryString) {
      endpoint += `?${queryString}`
    }
    const response = await apiInstance.get(endpoint)
    return response.data
  },
}
