import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios'
import { API_BASE_URL } from '../config/api'

// Extend the InternalAxiosRequestConfig to include _retry
interface CustomAxiosRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean
}

// Create axios instance
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Important for cookies
})

// Request interceptor
axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('accessToken')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error: AxiosError) => {
    return Promise.reject(error)
  }
)

// Response interceptor
axiosInstance.interceptors.response.use(
  (response) => {
    return response
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as CustomAxiosRequestConfig

    // List of public endpoints that should NOT trigger token refresh
    const publicEndpoints = ['/auth/login', '/auth/register', '/auth/verify', '/auth/forgot-password', '/auth/reset-password', '/auth/resend-code']
    const isPublicEndpoint = publicEndpoints.some(endpoint => originalRequest.url?.includes(endpoint))

    // If error is 401 and we haven't retried yet and it's NOT a public endpoint
    if (error.response?.status === 401 && !originalRequest._retry && !isPublicEndpoint) {
      originalRequest._retry = true

      try {
        // Try to refresh the token
        const response = await axios.post(
          `${API_BASE_URL}/auth/refresh`,
          {},
          { withCredentials: true }
        )

        const { access_token } = response.data.data

        // Store new access token
        localStorage.setItem('accessToken', access_token)

        // Update the original request with new token
        originalRequest.headers.Authorization = `Bearer ${access_token}`

        // Retry the original request
        return axiosInstance(originalRequest)
      } catch (refreshError) {
        // Refresh failed, clear auth data
        localStorage.removeItem('accessToken')
        localStorage.removeItem('user')
        
        // Redirect to login
        window.location.href = '/login'
        
        return Promise.reject(refreshError)
      }
    }

    return Promise.reject(error)
  }
)

export default axiosInstance
