export interface ClientsResponse {
  count: number
  next: string | null
  previous: string | null
  results: {
    success: boolean
    message: string
    clients: Client[]
    total_count: number
  }
}

export interface StatsResponse {
  success: boolean
  message: string
  stats: {
    clients: {
      total: number
      active: number
      verified: number
      inactive: number
      with_bookings: number
      without_bookings: number
      recent_signups: number
    }
    bookings: {
      total: number
      confirmed: number
      pending: number
      cancelled: number
      recent: number
    }
    revenue: {
      total: number
      recent_30_days: number
    }
    activity: {
      period: string
      new_clients: number
      new_bookings: number
    }
  }
}

export interface Client {
  id: string
  phone_number: string
  masked_phone: string
  email: string
  full_name: string
  first_name: string
  last_name: string
  gender: "M" | "F"
  region: string
  region_display: string
  city_town: string
  is_active: boolean
  is_verified: boolean
  date_joined: string
  last_login: string | null
  booking_count: number
  total_bookings_amount: number | null
  last_booking_date: string | null
}

export interface Seat {
  id: number
  seat_number: string
  seat_type: "window" | "aisle"
  is_available: boolean
  is_booked: boolean
}

export interface Bus {
  id: number
  bus_id: number
  plate_number: string
  bus_type: string
  total_seats: number
  seats: Seat[]
}

export interface RouteAssignment {
  id: string
  route_name: string
  departure_time: string
  arrival_time: string
  is_active: boolean
}

export interface MaintenanceRecord {
  id: string
  date: string
  type: string
  description: string
  cost: number
  mechanic_name: string
}

export interface BusesResponse {
  count: number
  next: string | null
  previous: string | null
  results: Bus[]
}

export interface Booking {
  id: string
  trip_id: string
  user: string
  user_details: {
    phone_number: string
    full_name: string
    email: string
    gender: "M" | "F"
  }
  status: "confirmed" | "pending" | "cancelled"
  status_display: string
  seat_number: string
  travel_date: string
  departure_terminal: string
  destination_terminal: string
  departure_time: string
  arrival_time: string
  plate_number: string
  route_name: string
  ticket_price: string
  booking_fee: string
  total_amount: string
  reference_id: string
  booking_date: string
  created_at: string
  updated_at: string
}

export interface BookingsResponse {
  count: number
  next: string | null
  previous: string | null
  results: Booking[]
}

export interface BookingCreateData {
  trip_id: string
  user: string
  seat_number: string
  ticket_price: number
  booking_fee: number
}