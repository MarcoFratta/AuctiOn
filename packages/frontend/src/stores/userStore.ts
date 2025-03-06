import { defineStore } from 'pinia'
import { z } from 'zod'

export const userSchema = z.object({
  id: z.string(),
  username: z.string(),
  email: z.string().email(),
})
export type User = z.infer<typeof userSchema>
export const useUserStore = defineStore('user', {
  state: () => ({
    user: null as User | null,
  }),
  actions: {
    setUser(newUser: User) {
      this.user = newUser
    },
    removeUser() {
      this.user = null
      this.$reset()
    },
  },
  getters: {
    exists: (state) => state.user !== null,
  },
  persist: true, // Enables persistence
})
