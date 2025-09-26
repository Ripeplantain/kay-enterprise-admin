import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios'
import { getSession, signOut } from 'next-auth/react'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000/api/"

// Create axios instance
const apiInstance: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add token
apiInstance.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const session = await getSession()
    if (session?.accessToken) {
      config.headers.Authorization = `Bearer ${session.accessToken}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor to handle 401 errors
apiInstance.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Token is invalid/expired, sign out user
      if (typeof window !== 'undefined') {
        await signOut({ callbackUrl: '/login' })
      }
    }
    return Promise.reject(error)
  }
)

export { apiInstance }
export default apiInstance