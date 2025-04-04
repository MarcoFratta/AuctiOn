<script lang="ts" setup>
import { useLobbyStore } from '@/stores/lobbyStore.ts'
import { computed } from 'vue'
import BaseCard from '@/components/common/BaseCard.vue'
import InnerCard from '@/components/common/InnerCard.vue'
import AppIcons from '@/components/icons/AppIcons.vue'

const lobbyStore = useLobbyStore()
const currentSale = computed(() => lobbyStore.lobby?.currentSale)
const seller = computed(() => {
  if (!currentSale.value) return undefined
  return lobbyStore.users.find((p) => p.id === currentSale.value?.sellerId)
})

// Calculate total weight of items in sale
const totalWeight = computed(() => currentSale.value?.info.weight ?? 0)

const bidPercentage = computed(() => {
  if (!currentSale.value || !lobbyStore.currentUser) return 0
  const currentBid = lobbyStore.lobby?.currentBid?.amount || 0
  const userMoney = lobbyStore.playerInfo?.money || 0
  if (userMoney === 0) return 100
  return Math.min(Math.round((currentBid / userMoney) * 100), 100)
})

const percentageColor = computed(() => {
  if (bidPercentage.value >= 90) return 'from-red-500 to-red-600'
  if (bidPercentage.value >= 70) return 'from-orange-500 to-orange-600'
  if (bidPercentage.value >= 50) return 'from-yellow-500 to-yellow-600'
  return 'from-green-500 to-green-600'
})

const percentageTextColor = computed(() => {
  if (bidPercentage.value >= 90) return 'text-red-500 dark:text-red-400'
  if (bidPercentage.value >= 70) return 'text-orange-500 dark:text-orange-400'
  if (bidPercentage.value >= 50) return 'text-yellow-500 dark:text-yellow-400'
  return 'text-green-500 dark:text-green-400'
})
</script>

<template>
  <BaseCard class="h-full flex flex-col">
    <!-- Header -->
    <div class="flex items-center gap-2 mb-2 md:mb-3">
      <div class="bg-fuchsia-100 dark:bg-app-fuchsia-500/20 p-1.5 md:p-2 rounded-lg">
        <AppIcons color="fuchsia" name="sale" />
      </div>
      <h2 class="text-lg md:text-xl font-semibold text-zinc-900 dark:text-white">Current Sale</h2>
    </div>

    <!-- Empty state -->
    <InnerCard v-if="!currentSale" class="flex-grow flex items-center justify-center">
      <div class="flex flex-col items-center gap-2">
        <AppIcons color="gray" name="waiting" size="lg" />
        <p class="text-gray-600 dark:text-gray-400 text-xs md:text-sm">Waiting for a sale...</p>
      </div>
    </InnerCard>

    <!-- Sale Info -->
    <InnerCard v-if="currentSale" class="flex-grow flex flex-col p-2 md:p-3">
      <!-- Seller Info -->
      <div class="flex items-center mb-2 md:mb-3">
        <div
          class="w-7 h-7 md:w-8 md:h-8 rounded-full bg-green-100 dark:bg-green-500/20 flex items-center justify-center text-green-600 dark:text-green-400 font-medium text-sm md:text-base mr-2 md:mr-3"
        >
          {{ seller?.username?.substring(0, 1).toUpperCase() || '?' }}
        </div>
        <div>
          <div class="text-xs md:text-sm text-gray-500 dark:text-gray-400">Seller</div>
          <div class="text-sm md:text-base font-medium text-gray-900 dark:text-white">
            {{ seller?.username || 'Unknown' }}
          </div>
        </div>
      </div>

      <!-- Items Summary -->
      <div
        class="bg-gray-50 dark:bg-neutral-800/50 rounded-lg p-2 md:p-3 mb-2 md:mb-3 border border-gray-200 dark:border-gray-700/50"
      >
        <div class="flex justify-between items-center">
          <div class="flex flex-col items-start">
            <h2 class="text-xs md:text-sm font-medium text-gray-600 dark:text-gray-300">
              Total Weight:
            </h2>
            <div class="text-orange-600 dark:text-orange-400 font-bold text-sm md:text-base">
              {{ totalWeight }}
            </div>
          </div>
        </div>
      </div>

      <!-- Bid Percentage Bar -->
      <div class="mt-auto">
        <div class="flex justify-between items-center mb-1">
          <span class="text-xs md:text-sm text-gray-600 dark:text-gray-400">Bid Impact</span>
          <span :class="[percentageTextColor, 'text-xs md:text-sm font-medium']"
            >{{ bidPercentage }}%</span
          >
        </div>
        <div class="h-1.5 md:h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div
            :class="percentageColor"
            :style="{ width: `${bidPercentage}%` }"
            class="h-full rounded-full bg-gradient-to-r"
          ></div>
        </div>
      </div>
    </InnerCard>
  </BaseCard>
</template>

<style scoped>
.bg-gradient-to-r {
  background-size: 200% 100%;
  animation: gradient 2s ease infinite;
}

@keyframes gradient {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}
</style>
