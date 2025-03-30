<script lang="ts" setup>
import { useLobbyStore } from '@/stores/lobbyStore.ts'
import { computed } from 'vue'

const lobbyStore = useLobbyStore()
const playerMoney = computed(() => lobbyStore.playerInfo?.money || 0)
</script>

<template>
  <!-- Game status indicators - Desktop version (hidden on small screens) -->
  <div class="ml-1 hidden sm:flex flex-wrap items-center gap-1.5 sm:gap-2 justify-end">
    <div
      class="bg-white dark:bg-app-violet-500/20 px-2 py-1 md:px-3 md:py-1.5 rounded-full align-middle flex items-center gap-1.5 border border-gray-200 dark:border-app-violet-500/30"
    >
      <span class="text-yellow-500 text-sm md:text-base">💰</span>
      <span class="font-bold text-xs md:text-sm text-green-600 dark:text-green-400"
        >${{ playerMoney }}</span
      >
    </div>
    <div
      class="bg-white dark:bg-app-violet-500/20 px-2 py-1 md:px-3 md:py-1.5 rounded-full shrink-0 border border-gray-200 dark:border-app-violet-500/30"
    >
      <span
        class="text-gray-600 dark:text-gray-300 text-xs md:text-sm flex items-center whitespace-nowrap"
      >
        Status:
        <span
          :class="
            lobbyStore.lobby?.currentSale
              ? 'text-green-600 dark:text-green-400'
              : 'text-yellow-600 dark:text-yellow-400'
          "
          class="font-bold ml-1"
        >
          {{ lobbyStore.lobby?.currentSale ? 'Active' : 'Waiting' }}
        </span>
      </span>
    </div>
    <div
      class="bg-white dark:bg-app-violet-500/20 px-2 py-1 md:px-3 md:py-1.5 rounded-full flex justify-between gap-1.5 items-center text-center shrink-0 border border-gray-200 dark:border-app-fuchsia-500/30"
    >
      <span class="text-gray-600 dark:text-gray-300 text-xs md:text-sm">Round</span>
      <span class="text-yellow-600 dark:text-yellow-400 font-bold text-xs md:text-sm">
        {{ lobbyStore.lobby?.currentRound ?? 0 }}/{{ lobbyStore.lobby?.maxRound }}
      </span>
    </div>
  </div>

  <!-- Mobile bottom bar (visible only on small screens) -->
  <div
    class="sm:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-black border-t border-app-violet-900/30 z-40 p-1.5"
  >
    <div class="flex justify-around items-center">
      <!-- Money -->
      <div class="flex flex-col items-center">
        <span class="text-yellow-500 text-base">💰</span>
        <span class="text-green-600 dark:text-green-400 font-bold text-xs">${{ playerMoney }}</span>
      </div>

      <!-- Status -->
      <div class="flex flex-col items-center">
        <span class="text-gray-600 dark:text-gray-400 text-xs">Status</span>
        <span
          :class="
            lobbyStore.lobby?.currentSale
              ? 'text-green-600 dark:text-green-400'
              : 'text-yellow-600 dark:text-yellow-400'
          "
          class="font-bold text-xs"
        >
          {{ lobbyStore.lobby?.currentSale ? 'Active' : 'Waiting' }}
        </span>
      </div>

      <!-- Round -->
      <div class="flex flex-col items-center">
        <span class="text-gray-600 dark:text-gray-400 text-xs">Round</span>
        <span class="text-yellow-600 dark:text-yellow-400 font-bold text-xs">
          {{ lobbyStore.lobby?.currentRound ?? 0 }}/{{ lobbyStore.lobby?.maxRound }}
        </span>
      </div>
    </div>
  </div>
</template>
