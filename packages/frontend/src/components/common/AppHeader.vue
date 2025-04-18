<script lang="ts" setup>
import { useSettingsStore } from '@/stores/settingsStore.ts'
import DefaultAuthLinks from '@/components/DefaultAuthLinks.vue'
import { useAuthStore } from '@/stores/authStore.ts'
import { useHeaderStore } from '@/stores/headerStore'
import { useLobbyStore } from '@/stores/lobbyStore'
import { computed } from 'vue'
import AppIcons from '@/components/icons/AppIcons.vue'
import { useRoute } from 'vue-router'

const settingsStore = useSettingsStore()
const authStore = useAuthStore()
const headerStore = useHeaderStore()
const lobbyStore = useLobbyStore()
const route = useRoute()

// Compute whether we have custom content
const hasCustomContent = computed(() => headerStore.used)

// Check if user is in an active lobby
const isInActiveLobby = computed(() => !!lobbyStore.lobby)

// Check if user is already on the lobby or play page
const isOnLobbyPage = computed(() => {
  const path = route.path
  return path.startsWith('/lobby') || path.startsWith('/play')
})

// Show lobby button only if in active lobby but not on lobby pages
const showLobbyButton = computed(() => isInActiveLobby.value && !isOnLobbyPage.value)

const emits = defineEmits(['openDrawer'])

const toggleDarkMode = () => {
  settingsStore.toggleDarkMode()
}
</script>

<template>
  <header
    class="sticky top-0 left-0 right-0 bg-white dark:bg-app-black border-b border-app-violet-900/30 h-12 flex items-center justify-between px-2 md:px-4 z-50 w-full"
  >
    <!-- Left section with menu button and title -->
    <div class="flex items-center">
      <!-- Menu Button -->
      <button
        class="mr-3 text-zinc-700 dark:text-gray-300 hover:text-zinc-900 dark:hover:text-white transition-colors flex items-center justify-center"
        @click="emits('openDrawer')"
      >
        <AppIcons name="menu" size="lg" />
      </button>

      <!-- Title -->
      <router-link class="flex items-center" to="/">
        <h1 class="text-lg font-bold text-zinc-900 dark:text-white">
          <slot name="title">AuctiOn</slot>
        </h1>
      </router-link>
    </div>

    <!-- Right section with theme toggle and user actions -->
    <div class="flex items-center gap-1">
      <!-- Enhanced Lobby Button - Only shown when in active lobby but not on lobby pages -->
      <router-link
        v-if="showLobbyButton"
        class="relative flex items-center text-md font-bold justify-center mr-2 px-2 py-1.5 rounded-lg bg-app-violet-500 text-white hover:bg-violet-600"
        title="Return to active lobby"
        to="/lobby"
      >
        <span class="absolute -top-1 -right-1 flex h-3 w-3">
          <span
            class="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"
          ></span>
          <span class="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
        </span>
        <span class="text-xs font-medium">Go to Auction</span>
      </router-link>

      <!-- Theme Toggle -->
      <button
        class="p-1.5 rounded-md text-zinc-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-app-fuchsia-900/20 transition-colors flex items-center justify-center"
        @click="toggleDarkMode"
      >
        <AppIcons :name="settingsStore.darkMode ? 'sun' : 'moon'" size="md" />
      </button>

      <!-- Target div for teleported content -->
      <div id="header-right-content" class="flex flex-row gap-2"></div>

      <!-- Default auth links if no custom content -->
      <template v-if="!hasCustomContent">
        <div class="flex items-center">
          <DefaultAuthLinks v-if="!authStore.isAuthenticated" />
          <router-link
            v-else
            class="p-1.5 rounded-md text-zinc-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-app-fuchsia-900/20 transition-colors flex items-center justify-center"
            to="/account"
            title="Profile"
          >
            <AppIcons name="account" size="md" />
          </router-link>
        </div>
      </template>
    </div>
  </header>
</template>

<style scoped>
@keyframes pulse {
  0%,
  100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
}

.animate-pulse-slow {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
</style>
