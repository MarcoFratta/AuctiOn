<script lang="ts" setup>
import { useLobbyStore } from '@/stores/lobbyStore.ts'
import { computed } from 'vue'

const lobbyStore = useLobbyStore()
const playerMoney = computed(() => lobbyStore.playerInfo?.money || 0)
</script>

<template>
  <!-- Game status indicators - Desktop version (hidden on small screens) -->
  <div class="hidden sm:flex flex-wrap items-center gap-2 sm:gap-3 justify-end">
    <div
      class="bg-gray-700 px-2 sm:px-3 py-1 rounded-full align-middle flex items-center gap-1 sm:gap-2"
    >
      <span class="text-yellow-400">💰</span>
      <span class="font-bold text-sm text-green-400 sm:text-base">${{ playerMoney }}</span>
    </div>
    <div class="bg-gray-700 px-2 py-1 lg:px-4 lg:py-2 rounded-full shrink-0">
      <span class="text-gray-400 text-xs lg:text-base flex items-center whitespace-nowrap">
        Status:
        <span
          :class="lobbyStore.lobby?.currentSale ? 'text-green-400' : 'text-yellow-500'"
          class="font-bold ml-1"
        >
          {{ lobbyStore.lobby?.currentSale ? 'Active' : 'Waiting' }}
        </span>
      </span>
    </div>
    <div
      class="bg-gray-700 px-2 py-1 lg:px-4 lg:py-2 rounded-full flex justify-between gap-1 lg:gap-2 items-center text-center shrink-0"
    >
      <span class="text-gray-400 text-xs lg:text-base">Round</span>
      <span class="text-yellow-400 font-bold text-xs lg:text-base">
        {{ lobbyStore.lobby?.currentRound ?? 0 }}/{{ lobbyStore.lobby?.maxRound }}
      </span>
    </div>
  </div>

  <!-- Mobile bottom bar (visible only on small screens) -->
  <div
    class="sm:hidden fixed bottom-0 left-0 right-0 bg-gray-800 border-t border-gray-700 z-40 p-2"
  >
    <div class="flex justify-around items-center">
      <!-- Money -->
      <div class="flex flex-col items-center">
        <span class="text-yellow-400 text-lg">💰</span>
        <span class="text-green-400 font-bold text-sm">${{ playerMoney }}</span>
      </div>

      <!-- Status -->
      <div class="flex flex-col items-center">
        <span class="text-gray-400 text-xs">Status</span>
        <span
          :class="lobbyStore.lobby?.currentSale ? 'text-green-400' : 'text-yellow-500'"
          class="font-bold text-xs"
        >
          {{ lobbyStore.lobby?.currentSale ? 'Active' : 'Waiting' }}
        </span>
      </div>

      <!-- Round -->
      <div class="flex flex-col items-center">
        <span class="text-gray-400 text-xs">Round</span>
        <span class="text-yellow-400 font-bold text-xs">
          {{ lobbyStore.lobby?.currentRound ?? 0 }}/{{ lobbyStore.lobby?.maxRound }}
        </span>
      </div>
    </div>
  </div>
</template>
