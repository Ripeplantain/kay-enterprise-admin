import apiInstance from "@/lib/api"
import { BookingsResponse, Booking, BookingCreateData } from "@/lib/types"

export const bookingService = {
  async getBookings(
    page: number = 1,
    search?: string,
    status?: string
  ): Promise<BookingsResponse> {
    const params = new URLSearchParams({
      page: page.toString(),
    })

    if (search) {
      params.append('search', search)
    }

    if (status) {
      params.append('status', status)
    }

    const response = await apiInstance.get<BookingsResponse>(
      `/booking/bookings/?${params.toString()}`
    )
    return response.data
  },

  async getBooking(id: string): Promise<{ success: boolean; booking: Booking }> {
    const response = await apiInstance.get<{ success: boolean; booking: Booking }>(
      `/booking/bookings/${id}/`
    )
    return response.data
  },

  async createBooking(data: BookingCreateData): Promise<{ success: boolean; booking: Booking; message: string }> {
    const response = await apiInstance.post<{ success: boolean; booking: Booking; message: string }>(
      '/booking/bookings/',
      data
    )
    return response.data
  },

  async updateBooking(
    id: string,
    data: Partial<BookingCreateData>
  ): Promise<{ success: boolean; booking: Booking; message: string }> {
    const response = await apiInstance.put<{ success: boolean; booking: Booking; message: string }>(
      `/booking/bookings/${id}/`,
      data
    )
    return response.data
  },

  async cancelBooking(id: string): Promise<{ success: boolean; message: string }> {
    const response = await apiInstance.delete<{ success: boolean; message: string }>(
      `/booking/bookings/${id}/`
    )
    return response.data
  }
}