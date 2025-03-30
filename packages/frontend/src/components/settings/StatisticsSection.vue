<script lang="ts" setup>
import { computed } from 'vue'
import BaseCard from '@/components/BaseCard.vue'

const props = defineProps<{
  stats: {
    wins: number
    losses: number
    gamesPlayed: number
  }
}>()

// Calculate win rate
const winRate = computed(() => {
  const { wins, gamesPlayed } = props.stats
  if (!gamesPlayed) return 0
  return Math.round((wins / gamesPlayed) * 100)
})
</script>

<template>
  <div class="w-full h-full">
    <BaseCard class="h-full">
      <h3
        class="text-xl font-bold text-zinc-900 dark:text-white mb-4 sm:mb-6 pb-4 border-b border-gray-200 dark:border-app-violet-900/30"
      >
        Game Statistics
      </h3>

      <!-- Stats Summary -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div
          class="bg-gray-50 dark:bg-app-black-90 border border-gray-200 dark:border-app-violet-900/20 p-4 rounded-lg text-center"
        >
          <div class="text-green-600 dark:text-green-400 text-3xl font-bold mb-1">
            {{ stats.wins }}
          </div>
          <div class="text-gray-500 dark:text-app-violet-300 text-sm">Wins</div>
        </div>

        <div
          class="bg-gray-50 dark:bg-app-black-90 border border-gray-200 dark:border-app-violet-900/20 p-4 rounded-lg text-center"
        >
          <div class="text-red-600 dark:text-red-400 text-3xl font-bold mb-1">
            {{ stats.losses }}
          </div>
          <div class="text-gray-500 dark:text-app-violet-300 text-sm">Losses</div>
        </div>

        <div
          class="bg-gray-50 dark:bg-app-black-90 border border-gray-200 dark:border-app-violet-900/20 p-4 rounded-lg text-center"
        >
          <div class="text-violet-600 dark:text-blue-400 text-3xl font-bold mb-1">
            {{ winRate }}%
          </div>
          <div class="text-gray-500 dark:text-app-violet-300 text-sm">Win Rate</div>
        </div>

        <div
          class="bg-gray-50 dark:bg-app-black-90 border border-gray-200 dark:border-app-violet-900/20 p-4 rounded-lg text-center"
        >
          <div class="text-fuchsia-600 dark:text-app-fuchsia-400 text-3xl font-bold mb-1">
            {{ stats.gamesPlayed }}
          </div>
          <div class="text-gray-500 dark:text-app-violet-300 text-sm">Games Played</div>
        </div>
      </div>

      <!-- Game History -->
      <h4 class="text-zinc-900 dark:text-white font-medium mb-4">Recent Games</h4>
      <div
        class="bg-gray-50 dark:bg-app-black-90 border border-gray-200 dark:border-app-violet-900/20 p-6 rounded-lg"
      >
        <div
          class="flex flex-col items-center justify-center text-center py-8 text-gray-500 dark:text-app-violet-300"
        >
          <svg
            class="w-16 h-16 mb-4 text-gray-400 dark:text-app-violet-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
            ></path>
          </svg>
          <p class="text-lg text-zinc-700 dark:text-white">Recent game history will appear here</p>
          <p class="text-sm mt-2">Check back soon for updates!</p>
        </div>
      </div>
    </BaseCard>
  </div>
</template>
