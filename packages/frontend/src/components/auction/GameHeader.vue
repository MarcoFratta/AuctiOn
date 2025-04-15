<script lang="ts" setup>
import { useLobbyStore } from '@/stores/lobbyStore.ts'
import { computed } from 'vue'

const lobbyStore = useLobbyStore()
const playerMoney = computed(() => lobbyStore.playerInfo?.money || 0)
</script>

<template>
  <!-- Game status indicators - Desktop version (hidden on small screens) -->
  <div class="ml-1 hidden sm:flex flex-wrap items-center gap-2 justify-end">
    <!-- Money -->
    <div
      class="bg-white dark:bg-neutral-900 px-3 py-1.5 rounded-lg border border-neutral-100 dark:border-neutral-800/50 flex items-center gap-1.5 shadow-sm"
    >
      <span class="text-yellow-500 text-sm">💰</span>
      <span class="font-medium text-sm text-green-600 dark:text-green-400">${{ playerMoney }}</span>
    </div>

    <!-- Status -->
    <div
      class="bg-white dark:bg-neutral-900 px-3 py-1.5 rounded-lg border border-app-violet-900/30 dark:border-neutral-800/50 flex items-center shadow-sm"
    >
      <span class="text-neutral-600 dark:text-neutral-300 text-sm">
        Status:
        <span
          :class="
            lobbyStore.lobby?.currentSale
              ? 'text-green-600 dark:text-green-400'
              : 'text-orange-600 dark:text-orange-400'
          "
          class="font-medium ml-1"
        >
          {{ lobbyStore.lobby?.currentSale ? 'Active' : 'Waiting' }}
        </span>
      </span>
    </div>

    <!-- Round -->
    <div
      class="bg-white dark:bg-neutral-900 px-3 py-1.5 rounded-lg border border-neutral-100 dark:border-neutral-800/50 flex items-center gap-1.5 shadow-sm"
    >
      <span class="text-neutral-600 dark:text-neutral-300 text-sm">Round:</span>
      <span class="text-app-violet-600 dark:text-app-violet-400 font-medium text-sm">
        {{ lobbyStore.lobby?.currentRound ?? 0 }}/{{ lobbyStore.lobby?.maxRound }}
      </span>
    </div>
  </div>
</template>
