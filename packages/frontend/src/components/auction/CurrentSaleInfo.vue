<script lang="ts" setup>
import { useLobbyStore } from '@/stores/lobbyStore.ts'
import { computed } from 'vue'

const lobbyStore = useLobbyStore()
const currentSale = computed(() => lobbyStore.lobby?.currentSale)
const seller = computed(() => {
  if (!currentSale.value) return undefined
  return lobbyStore.users.find((p) => p.id === currentSale.value?.sellerId)
})

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
  if (bidPercentage.value >= 90) return 'text-red-500'
  if (bidPercentage.value >= 70) return 'text-orange-500'
  if (bidPercentage.value >= 50) return 'text-yellow-500'
  return 'text-green-500'
})
</script>

<template>
  <div class="bg-gray-800 p-3 rounded-lg shadow-lg h-full flex flex-col">
    <!-- Header -->
    <div class="flex items-center justify-between mb-4">
      <h2 class="text-lg font-bold text-white flex items-center">
        <span class="mr-2">📦</span> Current Sale
      </h2>
      <div
        v-if="currentSale"
        class="bg-green-500 bg-opacity-10 px-2.5 py-1 rounded-full border border-emerald-500/20"
      >
        <span class="text-white text-xs font-medium">Active</span>
      </div>
    </div>

    <!-- Main Content -->
    <div class="bg-gray-700 p-2 xl:p-4 rounded-lg flex-grow flex flex-col">
      <!-- Active Sale State -->
      <div v-if="currentSale" class="h-full flex flex-col justify-between">
        <!-- Sale Info Section -->
        <div>
          <!-- Seller Info -->
          <div class="bg-gray-750 rounded-lg p-2">
            <div class="flex items-center">
              <div
                class="bg-blue-500/10 p-2.5 rounded-lg border border-blue-400/20 mr-3 flex-shrink-0 flex items-center justify-center"
              >
                <svg
                  class="h-6 w-6 text-blue-300"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                  />
                </svg>
              </div>
              <div>
                <div class="text-white text-sm font-medium">Seller</div>
                <div class="text-blue-300 text-sm mt-1">{{ seller?.username ?? '' }}</div>
              </div>
            </div>
          </div>

          <!-- Weight Info -->
          <div class="bg-gray-750 rounded-lg p-2">
            <div class="flex items-center">
              <div
                class="bg-orange-500/10 p-2.5 rounded-lg border border-orange-400/20 mr-3 flex-shrink-0 flex items-center justify-center"
              >
                <svg
                  class="h-6 w-6 text-orange-300"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                  />
                </svg>
              </div>
              <div class="text-left">
                <div class="text-white text-sm font-medium">Total Weight</div>
                <div class="text-orange-300 text-md font-medium">{{ currentSale.info.weight }}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Bid Progress Section -->
        <div class="mt-4">
          <div class="bg-gray-750 rounded-lg p-3">
            <div class="flex items-center mb-2">
              <div
                class="bg-purple-500/10 p-3 rounded-lg border border-purple-400/20 mr-3 flex-shrink-0 flex items-center justify-center"
              >
                <svg
                  class="h-5 w-5 text-purple-300"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                  />
                </svg>
              </div>
              <div>
                <div class="text-white text-sm font-medium">Current Bid</div>
                <div :class="[percentageTextColor, 'text-sm font-medium mt-1']">
                  {{ bidPercentage }}% of your money
                </div>
              </div>
            </div>

            <!-- Progress Bar -->
            <div class="h-3 bg-gray-800 rounded-full overflow-hidden mt-3">
              <div
                :class="percentageColor"
                :style="{ width: `${bidPercentage}%` }"
                class="h-full rounded-full bg-gradient-to-r transition-all duration-500 ease-out"
              ></div>
            </div>
          </div>
        </div>
      </div>

      <!-- No Sale State -->
      <div v-else class="h-full flex flex-col items-center justify-center text-center py-6">
        <div class="bg-gray-750 rounded-full p-4 mb-3">
          <svg
            class="h-8 w-8 text-gray-400"
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
            />
          </svg>
        </div>
        <h3 class="text-white font-medium mb-1">No Active Sale</h3>
        <p class="text-blue-200 text-sm">Waiting for the next auction...</p>
      </div>
    </div>
  </div>
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
