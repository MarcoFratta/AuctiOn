import apiClient from './apiClient'

export async function login(email: string, password: string) {
  const response = await apiClient.post('/auth/login', { email, password })
  return response.data
}

export async function register(name: string, email: string, password: string) {
  const response = await apiClient.post('/auth/register', { name, email, password })
  return response.data
}

export async function refresh() {
  const response = await apiClient.post('/auth/refresh')
  return response.data
}
