const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8001/api/"

interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
}

interface ClientsResponse {
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

interface StatsResponse {
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

interface Client {
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

class ApiClient {
  private baseURL: string
  private token: string | null = null

  constructor() {
    this.baseURL = API_BASE_URL
  }

  setToken(token: string) {
    this.token = token
  }

  getToken(): string | null {
    return this.token
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string> || {}),
    }

    const token = this.getToken()
    if (token) {
      headers.Authorization = `Bearer ${token}`
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`HTTP error! status: ${response.status}, body: ${errorText}`)
      }

      return await response.json()
    } catch (error) {
      console.error('API request failed:', error)
      throw error
    }
  }

  async login(username: string, password: string) {
    return this.request('auth/admin/login/', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    })
  }

  async getClients(page: number = 1, search?: string): Promise<ClientsResponse> {
    let endpoint = `auth/admin/clients/?page=${page}`
    if (search) {
      endpoint += `&search=${encodeURIComponent(search)}`
    }
    return this.request<ClientsResponse>(endpoint)
  }

  async getStats(): Promise<StatsResponse> {
    return this.request<StatsResponse>('auth/admin/stats/')
  }
}

export const apiClient = new ApiClient()
export type { Client, ClientsResponse, StatsResponse }