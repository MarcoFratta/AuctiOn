import apiClient from './apiClient'

export async function login(email: string, password: string) {
  const response = await apiClient.post('/auth/login', { email, password })
  return response.data
}

export async function logout() {
  const response = await apiClient.post('/auth/logout')
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

export async function forgotPassword(email: string) {
  const response = await apiClient.post(`/auth/forgot/${email}`)
  return response.data
}

export async function resetPassword(token: string, password: string) {
  const response = await apiClient.post('/auth/reset', { token, password })
  return response.data
}
