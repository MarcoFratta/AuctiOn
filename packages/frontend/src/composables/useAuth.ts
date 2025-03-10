import {
  login as loginApi,
  refresh as refreshApi,
  register as registerApi,
} from '@/api/authService'
import { useAuthStore } from '@/stores/authStore.ts'
import { type User, userSchema, useUserStore } from '@/stores/userStore.ts'
import { validateSchema } from '@auction/common/validation'

export function useAuth() {
  const tokens = useAuthStore()
  const users = useUserStore()

  async function login(email: string, password: string) {
    try {
      const data = await loginApi(email, password)
      tokens.setTokens(data.user.token)
      delete data.user.token
      users.setUser(data.user)
    } catch (error) {
      console.error('Login failed', error)
      throw error
    }
  }

  async function register(name: string, email: string, password: string) {
    try {
      const data = await registerApi(name, email, password)
      tokens.setTokens(data.user.token)
      delete data.user.token
      users.setUser(data.user)
    } catch (error) {
      console.log('Register failed', error)
      throw error
    }
  }

  async function refresh() {
    try {
      const data = await refreshApi()
      tokens.setTokens(data.token)
      const user: User = validateSchema(userSchema, {
        ...data.user,
        username: data.user.name,
      })
      users.setUser(user)
      console.log('Refreshed token')
    } catch (error) {
      console.error('Refresh failed', error)
      logout()
      throw error
    }
  }

  function logout() {
    tokens.clearTokens()
    users.removeUser()
  }

  return { register, login, refresh }
}
