<script lang="ts" setup>
import { useSettingsStore } from '@/stores/settingsStore'

const settingsStore = useSettingsStore()

defineEmits<{
  (e: 'toggleDrawer'): void
}>()

const toggleDarkMode = () => {
  settingsStore.toggleDarkMode()
}
</script>

<template>
  <header
    class="bg-white dark:bg-app-black border-b border-app-violet-900/30 h-12 flex items-center justify-between px-4 z-20 sticky top-0 left-0 right-0"
  >
    <!-- Left section with menu button and title -->
    <div class="flex items-center">
      <!-- Menu Button -->
      <button
        class="mr-3 text-zinc-700 dark:text-gray-300 hover:text-zinc-900 dark:hover:text-white transition-colors"
        @click="$emit('toggleDrawer')"
      >
        <svg
          class="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M4 6h16M4 12h16M4 18h16"
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
          />
        </svg>
      </button>

      <!-- Title -->
      <router-link class="flex items-center" to="/">
        <h1 class="text-lg font-bold text-zinc-900 dark:text-white">
          <slot name="title">AuctiOn</slot>
        </h1>
      </router-link>
    </div>

    <!-- Right section with theme toggle and user actions -->
    <div class="flex items-center">
      <!-- Theme Toggle -->
      <button
        class="p-1 rounded-md text-zinc-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-app-fuchsia-900/20 transition-colors"
        @click="toggleDarkMode"
      >
        <svg
          v-if="settingsStore.darkMode"
          class="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
          />
        </svg>
        <svg
          v-else
          class="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
          />
        </svg>
      </button>

      <!-- Right content slot -->
      <slot name="header-content"></slot>
    </div>
  </header>
</template>

<style scoped>
/* Add any additional styles here */
</style>
