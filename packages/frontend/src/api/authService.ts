import apiClient from './apiClient'
import { isAxiosError } from 'axios'
import {
  InvalidData,
  PasswordIncorrect,
  TooManyRequests,
  UserAlreadyRegistered,
  UserNotFound,
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
        throw new UserNotFound(email)
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
  }
}

export async function refresh() {
  const response = await apiClient.post('/auth/refresh')
  return response.data
}
