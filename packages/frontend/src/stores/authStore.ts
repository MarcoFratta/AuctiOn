import { defineStore } from 'pinia'

export const useAuthStore = defineStore('tokens', {
  state: () => ({
    accessToken: '',
  }),
  actions: {
    setTokens(access: string) {
      this.accessToken = access
    },
    clearTokens() {
      this.accessToken = ''
    },
  },
  getters: {
    isAuthenticated: (state) => state.accessToken == null || state.accessToken !== '',
  },
})
