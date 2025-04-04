<script lang="ts" setup>
import { onBeforeMount, ref, watch } from 'vue'
import { useAuthStore } from '@/stores/authStore.ts'
import AppHeader from '@/components/common/AppHeader.vue'
import { useLobbyMsgHandler } from '@/composables/useLobbyMsgHandler.ts'
import { useAuctionNotifications } from '@/composables/useAuctionNotifications.ts'
import { useAuth } from '@/composables/useAuth.ts'
import { useLobbyService } from '@/composables/useLobbyService.ts'
import { useAuctionConnection } from '@/composables/useAuctionConnection.ts'
import { useSettingsStore } from '@/stores/settingsStore'
import NavigationDrawer from '@/components/common/NavigationDrawer.vue'

const authStore = useAuthStore()
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
  <NavigationDrawer :is-open="isDrawerOpen" @closeDrawer="toggleDrawer" />
  <AppHeader @openDrawer="toggleDrawer"> </AppHeader>
  <router-view />
</template>
