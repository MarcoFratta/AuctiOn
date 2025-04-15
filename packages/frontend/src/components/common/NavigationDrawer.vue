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

const emits = defineEmits(['closeDrawer'])

const menuItems = [
  {
    label: 'Home',
    route: '/',
  },
  {
    label: 'Create Lobby',
    route: '/create',
    showIf: () => authStore.isAuthenticated && !lobbyStore.lobby,
  },
  {
    label: 'Join Lobby',
    route: '/join',
    showIf: () => authStore.isAuthenticated && !lobbyStore.lobby,
  },
  {
    label: 'Account',
    route: '/account',
    showIf: () => authStore.isAuthenticated,
  },
  {
    label: 'Go to lobby',
    route: '/lobby',
    showIf: () => authStore.isAuthenticated && lobbyStore.lobby && !lobbyStore.lobby.startTimestamp,
  },
  {
    label: 'Play',
    route: '/lobby',
    showIf: () => authStore.isAuthenticated && lobbyStore.lobby?.startTimestamp,
  },
  {
    label: 'Game rules',
    route: '/rules',
  },
]

const handleLogout = async () => {
  await auth.logout()
  router.push('/login')
}

const closeDrawer = () => {
  emits('closeDrawer')
}
</script>

<template>
  <!-- Backdrop Overlay with transition -->
  <div
    :class="[
      isOpen
        ? 'pointer-events-auto bg-gray-500/20 dark:bg-app-black-40 backdrop-blur-md'
        : 'pointer-events-none bg-transparent dark:bg-app-black-0 backdrop-blur-none',
    ]"
    class="fixed inset-0 z-30 transition-all duration-100 ease-in-out"
    @click="closeDrawer"
  ></div>

  <!-- Drawer -->
  <div
    :class="[
      'fixed left-0 top-0 h-full w-72 bg-white/90 dark:bg-app-black/90 backdrop-blur-md z-40 transform transition-transform duration-300 ease-in-out shadow-lg',
      isOpen ? 'translate-x-0' : '-translate-x-full',
    ]"
  >
    <!-- Drawer Header -->
    <div
      class="h-12 flex items-center justify-start px-6 border-b border-gray-100 dark:border-gray-800"
    >
      <router-link class="flex items-center" to="/">
        <img alt="AuctiOn Logo" class="h-10" src="../../assets/app-logo.svg" style="filter: none" />
        <h2
          class="ml-2 text-2xl font-bold bg-gradient-to-r from-app-violet-500 to-app-fuchsia-500 text-transparent bg-clip-text"
        >
          Auction
        </h2>
      </router-link>
    </div>

    <!-- Navigation Links -->
    <nav class="p-4">
      <ul class="space-y-1">
        <li v-for="item in menuItems" :key="item.route">
          <router-link
            v-show="item.showIf ? item.showIf() : true"
            :to="item.route"
            class="block px-2 py-3.5 rounded-lg text-gray-700 dark:text-app-white hover:text-app-violet-600 font-medium transition-all duration-200"
            @click="closeDrawer"
          >
            {{ item.label }}
          </router-link>
        </li>
      </ul>
    </nav>

    <!-- Logout Button -->
    <div
      v-if="authStore.isAuthenticated"
      class="absolute bottom-0 w-full p-4 border-t border-gray-100 dark:border-gray-800"
    >
      <button
        class="w-full px-6 py-3.5 rounded-lg text-red-500 dark:text-red-400 hover:text-red-600 dark:hover:text-red-300 font-medium transition-all duration-200 text-left"
        @click="handleLogout"
      >
        Logout
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
  backdrop-filter: blur(8px);
}
</style>
