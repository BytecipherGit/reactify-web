import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios'

import { API_BASE_URL } from './env'

// Base API configuration
const baseURL = API_BASE_URL

export const api = axios.create({
  baseURL,
  timeout: 30000,
  // Only use withCredentials in production when making direct requests
  // In development, the proxy handles credentials
  withCredentials: import.meta.env.PROD,
  headers: {
    'Content-Type': 'application/json',
  },
  // Ensure axios handles CORS properly
  validateStatus: (status) => status < 500, // Don't throw on 4xx errors
})

// Request interceptor - Add auth token
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('auth_token')
    if (token) {
      config.headers['x-auth-token'] = token
    }
    
    // Add timestamp for replay protection
    if (!config.headers['x-timestamp']) {
      config.headers['x-timestamp'] = Date.now().toString()
    }
    
    // Don't set Content-Type for FormData - let browser set it with boundary
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type']
    }
    
    // In development, ensure we're using relative URLs to go through Vite proxy
    // This avoids CORS issues by making requests appear same-origin
    if (import.meta.env.DEV && config.url && config.url.startsWith('http')) {
      // If URL is absolute, convert to relative to use proxy
      const url = new URL(config.url)
      config.url = url.pathname + url.search
    }
    
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor - Handle errors and token refresh
api.interceptors.response.use(
  (response) => {
    // Update token if server sends a new one
    const newToken = response.headers['x-auth-token']
    if (newToken && newToken !== localStorage.getItem('auth_token')) {
      localStorage.setItem('auth_token', newToken)
    }
    return response
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean
    }

    // Handle 401 Unauthorized
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      try {
        // Attempt to refresh token
        const refreshResponse = await api.post(
          '/auth/refresh',
          {}
        )

        if (refreshResponse.data?.token) {
          const newToken = refreshResponse.data.token
          localStorage.setItem('auth_token', newToken)
          originalRequest.headers['x-auth-token'] = newToken
          return api(originalRequest)
        }
      } catch (refreshError) {
        // Refresh failed - clear auth and redirect to login
        localStorage.removeItem('auth_token')
        localStorage.removeItem('user')
        if (window.location.pathname !== '/login') {
          window.location.href = `/login?redirect=${encodeURIComponent(window.location.pathname)}`
        }
        return Promise.reject(refreshError)
      }
    }

    // Handle CORS errors specifically
    if (!error.response && error.request) {
      // This is likely a CORS error
      const corsError = new Error(
        'CORS Error: The server is not allowing requests from this origin. ' +
        'Please ensure the backend has configured CORS to allow requests from ' +
        `${window.location.origin}. If you are the backend administrator, add this origin to ALLOWED_ORIGINS.`
      )
      console.error('CORS Error:', corsError.message)
      return Promise.reject(corsError)
    }

    // Handle other errors
    if (error.response) {
      const status = error.response.status
      const data = error.response.data as any
      const errorMessage = data?.message || data?.error || `Server error (${status})`

      switch (status) {
        case 403:
          console.error('Forbidden:', errorMessage)
          break
        case 404:
          console.error('Not found:', errorMessage)
          break
        case 429:
          console.error('Rate limited:', errorMessage)
          break
        case 500:
        case 502:
        case 503:
        case 504:
          console.error('Server error:', errorMessage)
          break
        default:
          console.error('API error:', errorMessage)
      }
    } else if (error.request) {
      console.error('Network error: Unable to connect to server')
    }

    return Promise.reject(error)
  }
)

export type ApiError = { error?: string; message?: string }
