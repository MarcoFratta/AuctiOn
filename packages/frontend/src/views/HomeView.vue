<template>
  <Background containerClass="flex justify-center items-center">
    <div class="flex flex-col items-center justify-center px-4 gap-2">
      <h1 class="text-5xl lg:text-7xl font-bold text-zinc-900 dark:text-white mb-6 text-center">
        Auction Game
      </h1>
      <span
        class="dark:text-app-violet-200 text-gray-600 text-xl mb-12 max-w-lg mx-auto text-center"
      >
        Join exciting auctions, trade items, and compete with other players
      </span>
      <!-- Centered Button -->
      <div class="flex justify-center w-full">
        <Button
          :bgColor="settingsStore.darkMode ? 'black' : '#f8f9fa'"
          :colors="
            settingsStore.darkMode
              ? ['#ff00ff', '#9900ff', '#6600ff']
              : ['#6366f1', '#8b5cf6', '#d946ef']
          "
          :duration="3500"
          class="text-zinc-900 dark:text-app-white"
          size="lg"
          @click="toggleLogin"
        >
          <b>Get Started 🚀</b>
        </Button>
      </div>
    </div>
  </Background>
</template>

<script lang="ts" setup>
import { useRouter } from 'vue-router'
import { useLobbyStore } from '@/stores/lobbyStore.ts'
import { onMounted } from 'vue'
import { useSocketStore } from '@/stores/socketStore.ts'
import { useSettingsStore } from '@/stores/settingsStore.ts'
import { GradientButton as Button } from '@/components/ui/gradient-button'
import Background from '@/components/Background.vue'

const router = useRouter()
const lobbyStore = useLobbyStore()
const socketStore = useSocketStore()
const settingsStore = useSettingsStore()

// Fix the infinite redirection by using onMounted and checking the current route
onMounted(() => {
  if (lobbyStore.lobby && socketStore.isConnected && router.currentRoute.value.path !== '/lobby') {
    console.log('forwarding to lobby from home')
    router.push('/lobby')
  }
})

// Single action function
const toggleLogin = () => {
  console.log('clicked')
  router.push('/login')
}
</script>
