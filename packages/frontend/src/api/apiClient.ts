import axios from 'axios'
import { useAuthStore } from '@/stores/authStore.ts'

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

// Handle 401 errors by refreshing the token
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      try {
        const res = await apiClient.post('/auth/refresh')
        const accessToken = res.data.token
        // Retry the original request with the new token
        error.config.headers.Authorization = `Bearer ${accessToken}`
        return apiClient(error.config)
      } catch (refreshError) {
        useAuthStore().accessToken = '' // Clear the invalid token
        window.location.href = '/login' // Redirect to login if refresh fails
      }
    }
    return Promise.reject(error)
  },
)

export default apiClient
