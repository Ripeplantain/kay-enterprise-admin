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
  trip_id: number
  seat_ids: number[]
  pickup_point_id: string
  drop_point_id: string
}

export interface BookingUpdateData {
  status?: 'confirmed' | 'pending' | 'cancelled'
  trip_id?: number
  seat_ids?: number[]
  pickup_point_id?: string
  drop_point_id?: string
}

export interface Route {
  id: number
  name: string
  origin: string
  destination: string
  distance_km: number
  estimated_duration_hours: number
  is_active: boolean
  created_at?: string
  updated_at?: string
}

export interface RoutesResponse {
  count: number
  next: string | null
  previous: string | null
  results: Route[]
}

export interface RouteCreateData {
  name: string
  origin: string
  destination: string
  distance_km: number
  estimated_duration_hours: number
  is_active: boolean
}

export interface RouteUpdateData {
  name?: string
  origin?: string
  destination?: string
  distance_km?: number
  estimated_duration_hours?: number
  is_active?: boolean
}

export interface PickupPoint {
  id?: number
  name: string
  time: string
}

export interface DropPoint {
  id?: number
  name: string
  time: string
}

export interface Trip {
  id: number
  route?: number
  route_name: string
  origin: string
  destination: string
  bus?: number
  bus_plate: string
  bus_type: string
  departure_datetime: string
  arrival_datetime: string
  price_per_seat: string | number
  available_seats: number
  status: 'scheduled' | 'boarding' | 'in_transit' | 'cancelled' | 'completed'
  pickup_points: PickupPoint[]
  drop_points: DropPoint[]
  created_at?: string
  updated_at?: string
}

export interface TripsResponse {
  count: number
  next: string | null
  previous: string | null
  results: Trip[]
}

export interface TripCreateData {
  route: number
  bus: number
  departure_datetime: string
  arrival_datetime: string
  price_per_seat: number
  available_seats: number
  status: 'scheduled' | 'boarding' | 'in_transit' | 'cancelled' | 'completed'
  pickup_points: PickupPoint[]
  drop_points: DropPoint[]
}

export interface TripUpdateData {
  route?: number
  bus?: number
  departure_datetime?: string
  arrival_datetime?: string
  price_per_seat?: number
  available_seats?: number
  status?: 'scheduled' | 'boarding' | 'departed' | 'cancelled' | 'completed'
  pickup_points?: PickupPoint[]
  drop_points?: DropPoint[]
}

export interface TripSeatsResponse {
  success: boolean
  message: string
  trip_id: number
  seats: Seat[]
}