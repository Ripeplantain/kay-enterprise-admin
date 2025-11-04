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
  id: number;
  booking_reference: string;
  trip: number;
  trip_details: {
    id: number;
    route_name: string;
    origin: string;
    destination: string;
    bus_plate: string;
    bus_type: string;
    departure_datetime: string;
    arrival_datetime: string;
    price_per_seat: string;
    available_seats: number;
    status: string;
    pickup_points: { name: string; time: string; }[];
    drop_points: { name: string; time: string; }[];
  };
  seat: number;
  seat_number: string;
  pickup_point_id: string;
  drop_point_id: string;
  total_amount: string;
  status: "confirmed" | "pending" | "cancelled" | "completed";
  agent?: number;
  agent_name?: string;
  agent_reference?: string;
  user?: string;
  user_details?: {
    phone_number: string;
    full_name: string;
    email: string;
    gender: "M" | "F";
  };
  luggage_items?: any[];
  created_at: string;
  updated_at: string;
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

export interface LuggageType {
  id: number
  name: string
  max_weight_kg: number
  price: number
  is_active: boolean
  created_at?: string
  updated_at?: string
}

export interface LuggageTypesResponse {
  count: number
  next: string | null
  previous: string | null
  results: LuggageType[]
}

export interface LuggageTypeCreateData {
  name: string
  max_weight_kg: number
  price: number
  is_active: boolean
}

export interface LuggageTypeUpdateData {
  name?: string
  max_weight_kg?: number
  price?: number
  is_active?: boolean
}

export interface Agent {
  id: number
  reference_number: string
  full_name: string
  phone_number: string
  email: string
  id_type: string
  id_number: string
  region: string
  city_town: string
  area_suburb?: string
  mobile_money_provider: string
  mobile_money_number: string
  availability: string
  referral_code?: string
  why_join: string
  status: 'pending' | 'approved' | 'rejected'
  commission_rate: string | number
  total_bookings: number
  total_earnings: string | number
  pending_commission?: string | number
  approved_by_name?: string
  approved_at?: string
  rejection_reason?: string
  created_at: string
  updated_at: string
}

export interface AgentsResponse {
  count: number
  next: string | null
  previous: string | null
  results: Agent[]
}

export interface AgentRegistrationData {
  full_name: string
  phone_number: string
  email: string
  id_type: string
  id_number: string
  region: string
  city_town: string
  area_suburb?: string
  mobile_money_provider: string
  mobile_money_number: string
  availability: string
  referral_code?: string
  why_join: string
}

export interface AgentApprovalData {
  commission_rate?: number
}

export interface AgentRejectionData {
  rejection_reason: string
}

export interface AgentBooking {
  booking_reference: string
  client_name: string
  trip_route: string
  total_amount: string | number
  commission_amount: string | number
  status: string
  created_at: string
}

export interface AgentBookingsResponse {
  count: number
  next: string | null
  previous: string | null
  results: AgentBooking[]
}

export interface BookingStats {
  total_bookings: number;
  confirmed_bookings: number;
  pending_bookings: number;
  cancelled_bookings: number;
  completed_bookings: number;
  total_revenue: number;
}

export interface AgentStats {
  agents: {
    total: number
    approved: number
    pending: number
    rejected: number
  }
  commissions: {
    total: string | number
    pending: string | number
    paid: string | number
  }
  bookings: {
    total_via_agents: number
    total_revenue: string | number
  }
  top_agents: Array<{
    id: number
    reference_number: string
    full_name: string
    total_bookings: number
    total_earnings: string | number
  }>
}