<template>
  <div class="w-full">
    <div class="flex items-center gap-2 mb-2">
      <div class="bg-blue-100 dark:bg-app-violet-500/20 p-1.5 rounded-lg">
        <svg
          class="h-4 w-4 text-blue-500 dark:text-app-violet-300"
          fill="currentColor"
          viewBox="0 0 20 20"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            clip-rule="evenodd"
            d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z"
            fill-rule="evenodd"
          />
        </svg>
      </div>
      <h2 class="text-lg font-semibold text-zinc-900 dark:text-white">Game Settings</h2>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
      <!-- Game Rules -->
      <InnerCard class="p-3">
        <h4 class="text-sm font-medium text-gray-600 dark:text-app-violet-200 mb-2">Game Rules</h4>
        <div class="space-y-2">
          <div class="flex justify-between items-center">
            <span class="text-sm text-gray-700 dark:text-app-violet-100">Rounds</span>
            <span
              class="px-2 py-0.5 bg-gray-100 dark:bg-app-violet-500/20 rounded-full text-xs font-medium text-gray-800 dark:text-white"
            >
              {{ lobby?.maxRound ?? 0 }}
            </span>
          </div>
          <div class="flex justify-between items-center">
            <span class="text-sm text-gray-700 dark:text-app-violet-100">Bid Time</span>
            <span
              class="px-2 py-0.5 bg-gray-100 dark:bg-app-violet-500/20 rounded-full text-xs font-medium text-gray-800 dark:text-white"
            >
              {{ lobby?.bidTime ?? 0 }}s
            </span>
          </div>
        </div>
      </InnerCard>

      <!-- Economy -->
      <InnerCard class="p-3">
        <h4 class="text-sm font-medium text-gray-600 dark:text-app-fuchsia-200 mb-2">Economy</h4>
        <div class="space-y-2">
          <div class="flex justify-between items-center">
            <span class="text-sm text-gray-700 dark:text-app-fuchsia-100">Starting Amount</span>
            <span
              class="px-2 py-0.5 bg-blue-100 dark:bg-app-fuchsia-500/20 text-blue-800 dark:text-white rounded-full text-xs font-medium"
            >
              ${{ lobby?.startAmount ?? 0 }}
            </span>
          </div>
          <div class="flex justify-between items-center">
            <span class="text-sm text-gray-700 dark:text-app-fuchsia-100">Max Players</span>
            <span
              class="px-2 py-0.5 bg-gray-100 dark:bg-app-fuchsia-500/20 rounded-full text-xs font-medium text-gray-800 dark:text-white"
            >
              {{ lobby?.maxPlayers ?? 0 }}
            </span>
          </div>
        </div>
      </InnerCard>
    </div>
  </div>
</template>

<script lang="ts" setup>
import InnerCard from '@/components/InnerCard.vue'

defineProps({
  lobby: {
    type: Object as () => {
      maxPlayers: number
      maxRound: number
      startAmount: number
      bidTime: number
    },
    required: true,
  },
})
</script>
