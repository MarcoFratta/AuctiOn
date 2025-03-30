<script lang="ts" setup>
import { computed, onBeforeMount, ref, watch } from 'vue'
import { useAuthStore } from '@/stores/authStore.ts'
import NavigationDrawer from '@/components/NavigationDrawer.vue'
import AppHeader from '@/components/AppHeader.vue'
import { useLobbyMsgHandler } from '@/composables/useLobbyMsgHandler.ts'
import { useAuctionNotifications } from '@/composables/useAuctionNotifications.ts'
import { useAuth } from '@/composables/useAuth.ts'
import { useLobbyService } from '@/composables/useLobbyService.ts'
import { useAuctionConnection } from '@/composables/useAuctionConnection.ts'
import { useSettingsStore } from '@/stores/settingsStore'

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
      lobbyService
        .checkActiveLobby()
        .then(() => {
          useAuctionConnection().connect()
        })
        .catch()
    }
  },
  { immediate: true },
)
onBeforeMount(() => useAuth().refresh().then().catch())

const settingsStore = useSettingsStore()
settingsStore.init()
// Watch for changes to the darkMode setting and update the HTML class
watch(
  () => settingsStore.darkMode,
  (isDark) => {
    if (isDark) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  },
  { immediate: true },
)
</script>

<template>
  <div class="min-w-screen min-h-screen flex flex-col">
    <!-- App Header with slots -->
    <AppHeader @toggle-drawer="toggleDrawer">
      <!-- Default title is provided in the component -->

      <!-- Right content slot -->
      <template #header-content>
        <!-- Teleport target for game status indicators -->
        <div id="header-content">
          <!-- Default auth links -->
          <nav v-if="notAuthenticated" class="flex items-center gap-2">
            <RouterLink
              class="text-zinc-800 dark:text-app-white font-medium transition-colors px-2 py-1 rounded-md hover:bg-app-fuchsia-900/30"
              to="/login"
            >
              Login
            </RouterLink>
            <RouterLink
              class="bg-app-fuchsia-600 hover:bg-app-fuchsia-dark text-white px-3 py-1 rounded-md transition-colors"
              to="/register"
            >
              Register
            </RouterLink>
          </nav>
          <nav v-else-if="!$route.fullPath.startsWith('/play')" class="flex items-center gap-4">
            <RouterLink
              class="text-zinc-800 font-medium dark:text-app-white hover:text-white transition-colors px-3 py-1 rounded-md hover:bg-app-fuchsia-900/30 flex items-center"
              to="/account"
            >
              Account
            </RouterLink>
          </nav>
        </div>
      </template>
    </AppHeader>

    <!-- Navigation Drawer -->
    <NavigationDrawer :is-open="isDrawerOpen" @toggle="toggleDrawer" />

    <!-- Main Content -->
    <main class="size-full">
      <RouterView></RouterView>
    </main>

    <!-- Footer -->
  </div>
</template>
