<script lang="ts" setup>
import { useRouter } from 'vue-router'
import { useAuth } from '@/composables/useAuth.ts'
import { useLobbyStore } from '@/stores/lobbyStore.ts'
import { useAuthStore } from '@/stores/authStore.ts'

const auth = useAuth()
const authStore = useAuthStore()
const lobbyStore = useLobbyStore()
const router = useRouter()

defineProps<{
  isOpen: boolean
}>()

const emit = defineEmits<{
  (e: 'toggle'): void
}>()

const menuItems = [
  { icon: '🏠', label: 'Home', route: '/' },
  {
    icon: '🎮',
    label: 'Create Lobby',
    route: '/create',
    showIf: () => authStore.isAuthenticated && !lobbyStore.lobby,
  },
  {
    icon: '🔍',
    label: 'Join Lobby',
    route: '/join',
    showIf: () => authStore.isAuthenticated && !lobbyStore.lobby,
  },
  { icon: '👤', label: 'Account', route: '/account', showIf: () => authStore.isAuthenticated },
  {
    icon: '🎯',
    label: 'Go to lobby',
    route: '/lobby',
    showIf: () => authStore.isAuthenticated && lobbyStore.lobby && !lobbyStore.lobby.startTimestamp,
  },
  {
    icon: '🎲',
    label: 'Play',
    route: '/lobby',
    showIf: () => authStore.isAuthenticated && lobbyStore.lobby?.startTimestamp,
  },
  {
    icon: '📜',
    label: 'Game rules',
    route: '/rules',
  },
]

const handleLogout = async () => {
  auth.logout()
  router.push('/login')
}

const closeDrawer = () => {
  emit('toggle')
}
</script>

<template>
  <!-- Backdrop Overlay with transition -->
  <div
    :class="[
      isOpen
        ? 'pointer-events-auto bg-app-black-40 backdrop-blur-md'
        : 'pointer-events-none bg-app-black-0 backdrop-blur-none',
    ]"
    class="fixed inset-0 z-30 transition-all duration-300 ease-in-out"
    @click="closeDrawer"
  ></div>

  <!-- Drawer -->
  <div
    :class="[
      'fixed left-0 top-0 h-full w-64 bg-app-black-90 backdrop-blur-md z-40 transform transition-transform duration-300 ease-in-out border-r border-app-violet-900/30',
      isOpen ? 'translate-x-0' : '-translate-x-full',
    ]"
  >
    <!-- Drawer Header - match height with main header -->
    <div class="h-12 flex items-center px-4 border-b border-app-violet-900/30">
      <h2 class="text-xl font-bold bg-clip-text text-transparent bg-gradient-fuchsia">AuctiOn</h2>
    </div>

    <!-- Navigation Links -->
    <nav class="p-4">
      <ul class="space-y-1">
        <li v-for="item in menuItems" :key="item.route">
          <router-link
            v-if="item.showIf ? item.showIf() : true"
            :to="item.route"
            class="flex items-center gap-3 p-2 rounded-lg text-gray-300 hover:bg-app-fuchsia-900/20 transition-colors"
            @click="closeDrawer"
          >
            <span class="text-xl">{{ item.icon }}</span>
            <span class="text-sm">{{ item.label }}</span>
          </router-link>
        </li>
      </ul>
    </nav>

    <!-- Logout Button -->
    <div
      v-if="authStore.isAuthenticated"
      class="absolute bottom-0 w-full p-4 border-t border-app-violet-900/30"
    >
      <button
        class="flex items-center gap-3 w-full p-2 rounded-lg text-red-400 hover:bg-app-fuchsia-900/20 transition-colors"
        @click="handleLogout"
      >
        <span class="text-xl">🚪</span>
        <span class="text-sm">Logout</span>
      </button>
    </div>
  </div>
</template>

<style scoped>
/* Ensure smooth transitions for backdrop-filter */
.backdrop-blur-none {
  backdrop-filter: blur(0px);
}

.backdrop-blur-md {
  backdrop-filter: blur(2px);
}
</style>
