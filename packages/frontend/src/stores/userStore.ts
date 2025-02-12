import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useUserStore = defineStore('user', {
  state: () => ({
    user: ref(null),
  }),
  actions: {
    setUser(newUser: any) {
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
