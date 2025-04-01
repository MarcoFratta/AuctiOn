<template>
  <Background container-class="w-full mt-4 px-2 lg:mt-12 xl:mt-16">
    <!-- Header with animated shapes -->
    <div class="flex flex-col items-center mb-4 lg:mb-8 relative">
      <div class="absolute top-0 -left-10 opacity-50 hidden md:block">
        <GameShapes
          :color="settingsStore.darkMode ? 'violet' : 'default'"
          animated
          size="md"
          type="circle"
        />
      </div>
      <div class="absolute top-0 -right-10 opacity-50 hidden md:block">
        <GameShapes
          :color="settingsStore.darkMode ? 'fuchsia' : 'default'"
          animated
          size="md"
          type="triangle"
        />
      </div>

      <Title class="text-4xl lg:text-5xl mb-2">Auction Results</Title>
      <p class="text-gray-600 dark:text-app-violet-200 text-center text-lg">
        Here are your last auction results!
      </p>
    </div>

    <!-- Leaderboard -->
    <div class="mb-8 w-full mx-auto flex justify-center">
      <LeaderboardDisplay class="max-w-3xl" />
    </div>

    <!-- Action Buttons -->
    <div class="flex justify-center mt-8 px-2">
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-md">
        <Button
          :bgColor="settingsStore.darkMode ? 'black' : '#f8f9fa'"
          :colors="
            settingsStore.darkMode
              ? ['#ff00ff', '#9900ff', '#6600ff']
              : ['#6366f1', '#8b5cf6', '#d946ef']
          "
          :duration="3500"
          class="text-zinc-900 dark:text-app-white w-full"
          size="lg"
          @click="backToHome"
        >
          <b>Back to Home 🏠</b>
        </Button>

        <Button
          :bgColor="settingsStore.darkMode ? 'black' : '#f1f5f9'"
          :colors="
            settingsStore.darkMode
              ? ['#6600ff', '#9900ff', '#ff00ff']
              : ['#d946ef', '#8b5cf6', '#6366f1']
          "
          :duration="3500"
          class="text-zinc-900 dark:text-app-white w-full"
          size="lg"
          @click="newGame"
        >
          <b>New Game 🎮</b>
        </Button>
      </div>
    </div>
  </Background>
</template>

<script lang="ts" setup>
import { useRouter } from 'vue-router'
import LeaderboardDisplay from '@/components/leaderboard/LeaderboardDisplay.vue'
import Background from '@/components/Background.vue'
import Title from '@/components/Title.vue'
import GameShapes from '@/components/ui/GameShapes.vue'
import { GradientButton as Button } from '@/components/ui/gradient-button'
import { useSettingsStore } from '@/stores/settingsStore.ts'

const router = useRouter()
const settingsStore = useSettingsStore()

function backToHome() {
  router.push('/')
}

function newGame() {
  router.push('/join')
}
</script>

<style scoped>
/* Smooth transitions */
button {
  transition: all 0.2s ease;
}

button:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

button:active {
  transform: translateY(0);
}
</style>
