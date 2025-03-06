import axios from 'axios'
import { useAuthStore } from '@/stores/authStore.ts'
import { UnauthenticatedError } from '@/api/Errors.ts'

const apiClient = axios.create({
  baseURL: 'http://192.168.1.120:8080', // Replace with your API URL
  headers: { 'Content-Type': 'application/json' },
  timeout: 5000,
  withCredentials: true, // Allows sending cookies (refresh token)
})

// Automatically attach the access token to requests
apiClient.interceptors.request.use((config) => {
  const accessToken = useAuthStore().accessToken
  if (accessToken !== '') {
    config.headers['Authorization'] = `Bearer ${accessToken}`
  }
  return config
})

// Flag to track if token refresh is in progress
let isRefreshing = false
let refreshSubscribers: ((token: string) => void)[] = []

function onRefreshed(token: string) {
  refreshSubscribers.forEach((callback) => callback(token))
  refreshSubscribers = [] // Clear after notifying all subscribers
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const authStore = useAuthStore()

    // Check if the request is already the refresh request
    const originalRequest = error.config
    if (originalRequest.url === '/auth/refresh') {
      console.error('Refresh token request failed:', error)
      authStore.clearTokens()
      return Promise.reject(error)
    }

    if (error.response?.status === 401) {
      if (!isRefreshing) {
        isRefreshing = true
        try {
          console.log('Refreshing access token...')
          const res = await apiClient.post('/auth/refresh', {}, { withCredentials: true })
          const accessToken = res.data.token
          console.log('Access token refreshed:', accessToken)
          authStore.setTokens(accessToken)

          // Notify all queued requests
          onRefreshed(accessToken)

          // Retry the failed request
          return apiClient(originalRequest)
        } catch (refreshError) {
          console.error('Failed to refresh access token:', refreshError)
          authStore.clearTokens()
          return Promise.reject(UnauthenticatedError)
        } finally {
          isRefreshing = false
        }
      }

      // Wait for the refresh process to complete before retrying the original request
      return new Promise((resolve) => {
        refreshSubscribers.push((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`
          resolve(apiClient(originalRequest))
        })
      })
    }

    return Promise.reject(error)
  },
)

export default apiClient
