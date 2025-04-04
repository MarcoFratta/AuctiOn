import { defineStore } from 'pinia'

export const useHeaderStore = defineStore('header', {
  state: () => ({
    used: false as boolean,
  }),
  actions: {
    useHeader() {
      this.used = true
    },
    reset() {
      this.used = false
    },
  },
})
