import { defineStore } from 'pinia'

export const useAuthStore = defineStore('tokens', {
  state: () => ({
    accessToken: '',
    refreshing: undefined as undefined | Promise<void>,
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
    isAuthenticated: (state) =>
      state.accessToken !== null && state.accessToken !== undefined && state.accessToken !== '',
  },
})
