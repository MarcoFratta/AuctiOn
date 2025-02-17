import axios from 'axios'
import { useAuthStore } from '@/stores/authStore.ts'
import { UnauthenticatedError } from '@/api/Errors.ts'

const apiClient = axios.create({
  baseURL: 'http://localhost:8080', // Replace with your API URL
  headers: { 'Content-Type': 'application/json' },
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

    if (error.response?.status === 401) {
      if (!isRefreshing) {
        isRefreshing = true
        try {
          console.log('Refreshing access token...')
          const res = await apiClient.post('/auth/refresh', {}, { withCredentials: true })
          const accessToken = res.data.token
          console.log('Access token refreshed:', accessToken)
          authStore.setTokens(accessToken)
          console.log('Retrying original request...')

          // Notify all queued requests
          const r = apiClient(error.config)
          onRefreshed(accessToken)
          return r
        } catch (refreshError) {
          console.error('Failed to refresh access token:', refreshError)
          authStore.clearTokens() // Remove invalid tokens
          return Promise.reject(UnauthenticatedError)
        } finally {
          isRefreshing = false
        }
      }

      // Wait for the refresh process to complete before retrying the original request
      return new Promise((resolve) => {
        refreshSubscribers.push((token) => {
          error.config.headers.Authorization = `Bearer ${token}`
          resolve(apiClient(error.config))
        })
      })
    }

    return Promise.reject(error)
  },
)

export default apiClient
