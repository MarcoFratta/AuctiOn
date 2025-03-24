<script lang="ts" setup>
import { computed, onBeforeMount, ref, watch } from 'vue'
import { useAuthStore } from '@/stores/authStore.ts'
import NavigationDrawer from '@/components/NavigationDrawer.vue'
import AppHeader from '@/components/AppHeader.vue'
import AppFooter from '@/components/AppFooter.vue'
import { useLobbyMsgHandler } from '@/composables/useLobbyMsgHandler.ts'
import { useAuctionNotifications } from '@/composables/useAuctionNotifications.ts'
import { useAuth } from '@/composables/useAuth.ts'
import { useLobbyService } from '@/composables/useLobbyService.ts'
import { useAuctionConnection } from '@/composables/useAuctionConnection.ts'

const authStore = useAuthStore()
const notAuthenticated = computed(() => !authStore.isAuthenticated)
const isDrawerOpen = ref(false)

// Provide the drawer toggle function to be used by child components
const toggleDrawer = () => {
  isDrawerOpen.value = !isDrawerOpen.value
}
const lobbyMsgHandler = useLobbyMsgHandler()
const auctionNotifications = useAuctionNotifications()
const lobbyService = useLobbyService()

lobbyMsgHandler.attach()
auctionNotifications.attach()
watch(
  () => authStore.isAuthenticated,
  async (isAuthenticated) => {
    if (isAuthenticated) {
      console.log('Checking active lobby')
      lobbyService
        .checkActiveLobby()
        .then(() => {
          useAuctionConnection().connect()
        })
        .catch()
    }
  },
)
onBeforeMount(async () => await useAuth().refresh())
</script>

<template>
  <div class="min-h-screen w-full bg-gray-900 flex flex-col">
    <!-- App Header with slots -->
    <AppHeader @toggle-drawer="toggleDrawer">
      <!-- Default title is provided in the component -->

      <!-- Right content slot -->
      <template #right-content>
        <!-- Teleport target for game status indicators -->
        <div id="header-right-content">
          <!-- Default auth links -->
          <nav v-if="notAuthenticated" class="flex items-center gap-4">
            <RouterLink
              class="text-gray-300 hover:text-white transition-colors px-3 py-1 rounded-md hover:bg-gray-700"
              to="/login"
            >
              Login
            </RouterLink>
            <RouterLink
              class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-1 rounded-md transition-colors"
              to="/register"
            >
              Register
            </RouterLink>
          </nav>
          <nav v-else class="flex items-center gap-4">
            <RouterLink
              class="text-gray-300 hover:text-white transition-colors px-3 py-1 rounded-md hover:bg-gray-700 flex items-center"
              to="/account"
            >
              <span class="mr-1">👤</span> Account
            </RouterLink>
          </nav>
        </div>
      </template>
    </AppHeader>

    <!-- Navigation Drawer -->
    <NavigationDrawer :is-open="isDrawerOpen" @toggle="toggleDrawer" />

    <!-- Main Content -->
    <main class="w-full mt-4 lg:mt-8 flex-grow">
      <RouterView></RouterView>
    </main>

    <!-- Footer -->
    <AppFooter class="mt-4 lg:mt-6 xl:mt-8" />
  </div>
</template>

// API base URL configuration export const API_BASE_URL = process.env.NODE_ENV === 'production' ?
'https://your-local-ip-or-domain/api' : 'http://localhost:8080/api';
