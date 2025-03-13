<script lang="ts" setup>
import { useRouter } from 'vue-router'
import { useAuth } from '@/composables/useAuth.ts'

const auth = useAuth()
const router = useRouter()

defineProps<{
  isOpen: boolean
}>()

const emit = defineEmits<{
  (e: 'toggle'): void
}>()

const menuItems = [
  { icon: '🏠', label: 'Home', route: '/' },
  { icon: '🎮', label: 'Create Lobby', route: '/create' },
  { icon: '🔍', label: 'Join Lobby', route: '/join' },
  { icon: '⚙️', label: 'Settings', route: '/settings' },
  { icon: '👤', label: 'Account', route: '/account' },
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
  <!-- Overlay -->
  <div v-if="isOpen" class="fixed inset-0 bg-black bg-opacity-50 z-30" @click="closeDrawer"></div>

  <!-- Drawer -->
  <div
    :class="[
      'fixed left-0 top-0 h-full w-64 bg-gray-800 z-40' +
        ' transform transition-transform duration-300 ease-in-out',
      isOpen ? 'translate-x-0' : '-translate-x-full',
    ]"
  >
    <!-- Drawer Header -->
    <div class="p-4 border-b border-gray-700">
      <h2 class="text-xl font-bold text-white">AuctiOn</h2>
    </div>

    <!-- Navigation Links -->
    <nav class="p-4">
      <ul class="space-y-2">
        <li v-for="item in menuItems" :key="item.route">
          <router-link
            :to="item.route"
            class="flex items-center gap-3 p-2 rounded-lg text-gray-300 hover:bg-gray-700 transition-colors"
            @click="closeDrawer"
          >
            <span class="text-xl">{{ item.icon }}</span>
            <span>{{ item.label }}</span>
          </router-link>
        </li>
      </ul>
    </nav>

    <!-- Logout Button -->
    <div class="absolute bottom-0 w-full p-4 border-t border-gray-700">
      <button
        class="flex items-center gap-3 w-full p-2 rounded-lg text-red-400 hover:bg-gray-700 transition-colors"
        @click="handleLogout"
      >
        <span class="text-xl">🚪</span>
        <span>Logout</span>
      </button>
    </div>
  </div>
</template>
