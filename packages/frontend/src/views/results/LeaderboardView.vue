<template>
  <Background container-class="overflow-y-auto scrollbar-hide">
    <!-- Replace the header with our new component -->
    <PageHeader subtitle="Here are your last auction results!" title="Auction Results" />

    <!-- Leaderboard -->
    <LobbyLoading
      v-if="!resultsStore.leaderboard"
      message="Please wait while we calculate the final standings."
      tipText="The auction has ended and the final results are being prepared."
      tipTitle="Game Complete"
      title="Loading Results"
    />
    <div v-else class="mb-8 w-full mx-auto flex justify-center">
      <LeaderboardDisplay class="max-w-3xl" />
    </div>

    <!-- Action Buttons -->
    <div class="flex justify-center mb-4 px-2 w-full">
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
import Background from '@/components/common/Background.vue'
import { GradientButton as Button } from '@/components/ui/gradient-button'
import { useSettingsStore } from '@/stores/settingsStore.ts'
import PageHeader from '@/components/common/PageHeader.vue'
import LobbyLoading from '@/components/lobby/LobbyLoading.vue'
import { useResultsStore } from '@/stores/resultsStore.ts'

const router = useRouter()
const settingsStore = useSettingsStore()
const resultsStore = useResultsStore()

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
