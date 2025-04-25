<script lang="ts" setup>
import { useLobbyStore } from '@/stores/lobbyStore.ts'
import { useLobbyInfo } from '@/composables/useLobbyInfo.ts'

const lobbyStore = useLobbyStore()
const lobbyInfo = useLobbyInfo()
const { userMoney } = lobbyInfo
</script>

<template>
  <div
    class="fixed w-full bottom-0 bg-white dark:bg-black border-t border-app-violet-900/30 px-3 py-2 h-12 sm:hidden z-40 shadow-sm"
  >
    <!-- Game status indicators for mobile -->
    <div class="flex items-center justify-between h-full">
      <!-- Left side: Money and Status -->
      <div class="flex items-center gap-2">
        <!-- Money -->
        <div
          class="bg-white/50 dark:bg-neutral-800/50 px-2 py-1 rounded-lg border border-app-violet-900/30 dark:border-neutral-800 flex items-center gap-1 shadow-sm"
        >
          <span class="text-yellow-500 text-sm">💰</span>
          <span class="font-medium text-sm text-green-600 dark:text-green-400"
            >${{ userMoney }}
          </span>
        </div>

        <!-- Status -->
        <div
          class="bg-white/50 dark:bg-neutral-800/50 px-2 py-1 rounded-lg border border-app-violet-900/30 dark:border-neutral-800 flex items-center shadow-sm"
        >
          <span class="text-neutral-600 dark:text-neutral-300 text-sm">
            Status:
            <span
              :class="
                lobbyStore.lobby?.currentSale
                  ? 'text-green-600 dark:text-green-400'
                  : 'text-orange-600 dark:text-orange-400'
              "
              class="font-medium"
            >
              {{ lobbyStore.lobby?.currentSale ? 'Active' : 'Waiting' }}
            </span>
          </span>
        </div>
      </div>

      <!-- Right side: Round, Timer, and Fullscreen toggle -->
      <div class="flex items-center gap-2">
        <!-- Round -->
        <div
          class="bg-white/50 dark:bg-neutral-800/50 px-2 py-1 rounded-lg border border-app-violet-900/30 dark:border-neutral-800 flex items-center gap-1 shadow-sm"
        >
          <span class="text-neutral-600 dark:text-neutral-300 text-sm">Round:</span>
          <span class="text-app-violet-600 dark:text-app-violet-400 font-medium text-xs">
            {{ lobbyStore.lobby?.currentRound ?? 0 }}/{{ lobbyStore.lobby?.maxRound }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>
