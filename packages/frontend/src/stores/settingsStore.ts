import { defineStore } from 'pinia'

export const useSettingsStore = defineStore('settings', {
  state: () => ({
    darkMode: true,
    auctionNotifications: true,
    lobbyNotifications: true,
  }),
  actions: {
    toggleDarkMode() {
      this.darkMode = !this.darkMode
      this.applyTheme()
    },
    disableNotifications() {
      this.auctionNotifications = false
      this.lobbyNotifications = false
    },
    applyTheme() {
      if (this.darkMode) {
        document.documentElement.classList.add('dark')
        document.documentElement.classList.remove('light')
      } else {
        document.documentElement.classList.remove('dark')
        document.documentElement.classList.add('light')
      }
    },
    init() {
      this.applyTheme()
    },
  },
  persist: true,
})
