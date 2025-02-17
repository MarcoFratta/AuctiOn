import apiClient from './apiClient'
import { isAxiosError } from 'axios'
import {
  InvalidData,
  NotFound,
  PasswordIncorrect,
  TooManyRequests,
  UserAlreadyRegistered,
} from '@/api/Errors.ts'

export async function login(email: string, password: string) {
  try {
    const response = await apiClient.post('/auth/login', { email, password })
    return response.data
  } catch (e) {
    if (isAxiosError(e)) {
      if (e.response?.status === 400) {
        throw new PasswordIncorrect()
      }
      if (e.response?.status === 404) {
        throw new NotFound()
      }
      if (e.response?.status === 429) {
        throw new TooManyRequests()
      }
    }
    throw e
  }
}

export async function register(name: string, email: string, password: string) {
  try {
    const response = await apiClient.post('/auth/register', { name, email, password })
    if (!(response.status === 200)) {
      throw new Error(JSON.stringify(response))
    }
    return response.data
  } catch (error) {
    if (isAxiosError(error)) {
      if (error.status == 409) {
        throw new UserAlreadyRegistered(email)
      }
      if (error.status == 400) {
        throw new InvalidData()
      }
    }
    throw error
  }
}

export async function refresh() {
  const response = await apiClient.post('/auth/refresh')
  return response.data
}
