<script lang="ts" setup>
import { onMounted, ref, watch } from 'vue'
import { useAuthStore } from '@/stores/authStore.ts'
import AppHeader from '@/components/common/AppHeader.vue'
import { useAuctionConnection } from '@/composables/useAuctionConnection.ts'
import { useSettingsStore } from '@/stores/settingsStore'
import NavigationDrawer from '@/components/common/NavigationDrawer.vue'
import { useLobbyMsgHandler } from '@/composables/useLobbyMsgHandler.ts'
import { useLobbyNotifications } from '@/composables/useLobbyNotifications.ts'
import { useAuctionNotifications } from '@/composables/useAuctionNotifications.ts'
import { useAuctionStats } from '@/composables/useAuctionStats.ts'

const authStore = useAuthStore()
const isDrawerOpen = ref(false)

// Provide the drawer toggle function to be used by child components
const toggleDrawer = () => {
  isDrawerOpen.value = !isDrawerOpen.value
}

const settingsStore = useSettingsStore()
settingsStore.init()
const lobbyMsgHandler = useLobbyMsgHandler()
const lobbyNotifications = useLobbyNotifications()
const auctionNotifications = useAuctionNotifications()
const auctionStats = useAuctionStats()
lobbyNotifications.attach()
lobbyMsgHandler.attach()
auctionNotifications.attach()
auctionStats.attach()
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
onMounted(() => {
  // Check if the user is authenticated
  if (authStore.isAuthenticated) {
    // If authenticated, connect to the auction
    useAuctionConnection()
      .connect()
      .then(undefined)
      .catch(() => {})
  }
})
</script>

<template>
  <div class="flex flex-col h-[100dvh] min-w-screen overflow-x-hidden">
    <AppHeader class="z-50" @openDrawer="toggleDrawer" />
    <NavigationDrawer :is-open="isDrawerOpen" @closeDrawer="toggleDrawer" />
    <main
      class="flex-1 size-full bg-app-white dark:bg-black overflow-y-hidden relative max-w-screen"
    >
      <router-view />
    </main>
  </div>
</template>
