<script lang="ts" setup>
import { computed, ref } from 'vue'
import { useAuthStore } from '@/stores/authStore.ts'
import NavigationDrawer from '@/components/NavigationDrawer.vue'

const authStore = useAuthStore()
const notAuthenticated = computed(() => !authStore.isAuthenticated)
const isDrawerOpen = ref(false)

const toggleDrawer = () => {
  isDrawerOpen.value = !isDrawerOpen.value
}
</script>

<template>
  <div class="min-h-screen w-full bg-gray-900">
    <!-- Header -->
    <header class="bg-gray-800 border-b px-2 md:px-4 lg:px-6 border-gray-700 sticky top-0 z-40">
      <div class="container mx-auto py-4">
        <div class="flex justify-between items-center">
          <!-- Left section with menu and title -->
          <div class="flex items-center gap-3">
            <button
              class="p-2 rounded-lg hover:bg-gray-700 transition-colors"
              @click="toggleDrawer"
            >
              <span class="text-xl text-white">☰</span>
            </button>
            <RouterLink class="text-2xl font-bold text-white" to="/">AuctiOn</RouterLink>
          </div>

          <!-- Right section -->
          <nav class="flex items-center gap-4">
            <RouterLink
              v-if="notAuthenticated"
              class="text-gray-300 hover:text-white transition-colors px-3 py-1 rounded-md hover:bg-gray-700"
              to="/login"
            >
              Login
            </RouterLink>
            <RouterLink
              v-if="notAuthenticated"
              class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-1 rounded-md transition-colors"
              to="/register"
            >
              Register
            </RouterLink>
          </nav>
        </div>
      </div>
    </header>

    <!-- Navigation Drawer -->
    <NavigationDrawer :is-open="isDrawerOpen" @toggle="toggleDrawer" />

    <!-- Main Content -->
    <main class="container mx-auto px-4">
      <RouterView></RouterView>
    </main>
  </div>
</template>
