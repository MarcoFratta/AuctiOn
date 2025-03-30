import { defineStore } from 'pinia'

export const useSettingsStore = defineStore('settings', {
  state: () => ({
    darkMode: true,
    notifications: true,
  }),
  actions: {
    toggleDarkMode() {
      this.darkMode = !this.darkMode
      this.applyTheme()
      console.log('Theme toggled:', this.darkMode ? 'dark' : 'light')
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
      console.log('Initializing theme, current setting:', this.darkMode ? 'dark' : 'light')
      this.applyTheme()
    },
  },
  persist: true,
})
