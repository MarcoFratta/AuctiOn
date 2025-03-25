<template>
  <Background>
    <div class="size-full flex items-center justify-center">
      <div class="flex flex-col items-center justify-center px-4">
        <h1 class="text-5xl lg:text-7xl font-bold text-white mb-6 text-center">Auction Game</h1>
        <span class="text-app-violet-200 text-xl mb-12 max-w-lg mx-auto text-center">
          Join exciting auctions, trade items, and compete with other players
        </span>
        <!-- Centered Button -->
        <div class="flex justify-center w-full">
          <Button
            :colors="['#ff00ff', '#9900ff', '#6600ff']"
            :duration="3500"
            bg-color="app-black-DEFAULT"
            class="text-white"
            size="lg"
            @click="toggleLogin"
          >
            Get Started 🚀
          </Button>
        </div>
      </div>
    </div>
  </Background>
</template>

<script lang="ts" setup>
import { useRouter } from 'vue-router'
import { useLobbyStore } from '@/stores/lobbyStore.ts'
import { onMounted } from 'vue'
import { useSocketStore } from '@/stores/socketStore.ts'
import { GradientButton as Button } from '@/components/ui/gradient-button'
import Background from '@/components/Background.vue'

const router = useRouter()
const lobbyStore = useLobbyStore()
const socketStore = useSocketStore()

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
