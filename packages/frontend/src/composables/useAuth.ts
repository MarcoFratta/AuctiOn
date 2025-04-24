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
import { InvalidData, PasswordIncorrect, UserAlreadyRegistered } from '@/api/Errors.ts'
import { useSocketStore } from '@/stores/socketStore.ts'
import { useAuctionConnection } from '@/composables/useAuctionConnection.ts'
import { baseSignUpSchema } from '@/schemas/authSchema.ts'

export function useAuth() {
  const tokens = useAuthStore()
  const users = useUserStore()
  const connection = useAuctionConnection()
  const { handleError } = useErrorsHandler()

  function createUserData(user: { name: string; id: string; email: string }): User {
    return validateSchema(userSchema, {
      ...user,
      username: user.name,
    }) as User
  }

  function validateEmail(email: string) {
    const e = baseSignUpSchema.shape.email.safeParse(email)
    if (!e.success) {
      throw new InvalidData()
    }
    return e.data
  }
  async function login(email: string, password: string) {
    try {
      const e = validateEmail(email)
      const data = await loginApi(e, password)
      tokens.setTokens(data.user.token)
      delete data.user.token
      users.setUser(createUserData(data.user))
      connection.connect().catch(() => {})
    } catch (error) {
      handleError(error, [[400, new PasswordIncorrect()]])
    }
  }

  async function register(name: string, email: string, password: string) {
    try {
      const e = validateEmail(email)
      const data = await registerApi(name, e, password)
      tokens.setTokens(data.user.token)
      delete data.user.token
      users.setUser(createUserData(data.user))
      connection.connect().catch(() => {})
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
        connection
          .connect()
          .then(undefined)
          .catch((_err) => {})
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
