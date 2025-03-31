import {
  forgotPassword as forgotPasswordApi,
  login as loginApi,
  logout as logoutApi,
  refresh as refreshApi,
  register as registerApi,
  resetPassword as resetPasswordApi,
} from '@/api/authService'
import { useAuthStore } from '@/stores/authStore.ts'
import { type User, userSchema, useUserStore } from '@/stores/userStore.ts'
import { validateSchema } from '@auction/common/validation'
import { useErrorsHandler } from '@/composables/useErrorsHandler.ts'
import { PasswordIncorrect, UserAlreadyRegistered } from '@/api/Errors.ts'
import { useSocketStore } from '@/stores/socketStore.ts'

export function useAuth() {
  const tokens = useAuthStore()
  const users = useUserStore()
  const { handleError } = useErrorsHandler()

  function createUserData(user: { name: string; id: string; email: string }): User {
    return validateSchema(userSchema, {
      ...user,
      username: user.name,
    }) as User
  }
  async function login(email: string, password: string) {
    try {
      const data = await loginApi(email, password)
      tokens.setTokens(data.user.token)
      delete data.user.token
      users.setUser(createUserData(data.user))
    } catch (error) {
      handleError(error, [[400, new PasswordIncorrect()]])
    }
  }

  async function register(name: string, email: string, password: string) {
    try {
      const data = await registerApi(name, email, password)
      tokens.setTokens(data.user.token)
      delete data.user.token
      users.setUser(createUserData(data))
    } catch (error) {
      handleError(error, [[409, new UserAlreadyRegistered(email)]])
    }
  }

  function refresh() {
    if (tokens.refreshing) {
      return tokens.refreshing
    }
    const p = refreshApi()
      .then((data) => {
        tokens.setTokens(data.token)
        users.setUser(createUserData(data.user))
      })
      .catch((error) => {
        handleError(error)
        logout()
      })
      .finally(() => {
        tokens.refreshing = undefined
      })
    tokens.refreshing = p
    return p
  }

  async function forgotPassword(email: string) {
    try {
      const response = await forgotPasswordApi(email)
      return response.data
    } catch (error) {
      handleError(error)
    }
  }

  async function resetPassword(token: string, newPassword: string) {
    try {
      const response = await resetPasswordApi(token, newPassword)
      return response.data
    } catch (error) {
      handleError(error)
    }
  }

  async function logout() {
    try {
      await logoutApi()
      tokens.clearTokens()
      users.removeUser()
      useSocketStore().disconnect()
    } catch (e) {
      handleError(e)
    }
  }

  return { register, login, refresh, logout, resetPassword, forgotPassword }
}
