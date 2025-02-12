import { useRouter } from 'vue-router'
import {
  login as loginApi,
  refresh as refreshApi,
  register as registerApi,
} from '@/api/authService'
import { useAuthStore } from '@/stores/authStore.ts'
import { useUserStore } from '@/stores/userStore.ts'

export function useAuth() {
  const router = useRouter()
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
      // Swal.fire({
      //   title: "Good job!",
      //   text: "You clicked the button!",
      //   icon: "success"
      // });
    } catch (error) {
      // Swal.fire({
      //   icon: "error",
      //   title: "Oops...",
      //   text: "Something went wrong!",
      //   footer: '<a href="#">Why do I have this issue?</a>'
      // });
      console.log('Register failed', error)
      throw error
    }
  }

  async function refresh() {
    try {
      const data = await refreshApi()
      tokens.setTokens(data.token)
      users.setUser(data.user)
      console.log('Refreshed token')
    } catch (error) {
      console.error('Refresh failed', error)
      logout()
    }
  }

  function logout() {
    tokens.clearTokens()
    users.removeUser()
  }

  return { register, login, logout, refresh }
}
