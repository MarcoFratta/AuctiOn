<template>
  <div class="bg-gray-800 p-3 lg:p-6 rounded-lg shadow-lg h-full flex flex-col">
    <h2 class="text-lg lg:text-2xl font-bold mb-3 lg:mb-4 flex items-center">
      <span class="mr-2">🔄</span> Seller Queue
    </h2>
    <div class="bg-gray-700 p-2 lg:p-4 rounded-lg flex-grow overflow-auto">
      <ul v-if="sortedSellerQueue.length" class="grid gap-2 lg:gap-4">
        <li
          v-for="(sellerId, index) in sortedSellerQueue"
          :key="sellerId"
          :class="{
            'border-l-4 border-yellow-400': index === 0,
          }"
          class="flex items-center p-2 lg:p-3 rounded-md bg-gray-800 transition-all"
        >
          <div class="flex items-center w-full flex-wrap gap-1">
            <!-- Status Dot -->
            <span
              :class="
                lobbyStore.users.find((p) => p.id === sellerId)?.connected
                  ? 'bg-green-400'
                  : 'bg-red-500'
              "
              class="w-2 h-2 lg:w-3 lg:h-3 rounded-full mr-1 lg:mr-2 shrink-0"
            ></span>

            <!-- Username -->
            <span class="text-white text-xs lg:text-base truncate max-w-[120px] lg:max-w-none">
              {{ lobbyStore.users.find((p) => p.id === sellerId)?.username ?? 'Unknown' }}
            </span>

            <!-- Spacer -->
            <span class="flex-grow"></span>

            <!-- Status Tags -->
            <div class="flex items-center gap-1 lg:gap-2 shrink-0 flex-wrap justify-end">
              <!-- "You" Tag -->
              <span
                v-if="sellerId === userStore?.user?.id"
                class="px-1 py-0.5 lg:px-2 lg:py-1 bg-gray-600 text-white text-xs rounded-full whitespace-nowrap"
              >
                You
              </span>

              <!-- Current/Next Tags -->
              <span
                v-if="index === 0"
                class="px-1 py-0.5 lg:px-2 lg:py-1 bg-yellow-500 bg-opacity-20 text-white text-xs rounded-full whitespace-nowrap"
              >
                Current
              </span>
              <span
                v-else-if="index === 1"
                class="px-1 py-0.5 lg:px-2 lg:py-1 bg-blue-500 bg-opacity-20 text-white text-xs rounded-full whitespace-nowrap"
              >
                Next
              </span>
            </div>
          </div>
        </li>
      </ul>
      <p v-else class="text-gray-400 text-center p-2 lg:p-4 text-xs lg:text-base">
        No sellers in queue
      </p>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { useLobbyStore } from '@/stores/lobbyStore'
import { useUserStore } from '@/stores/userStore'

const lobbyStore = useLobbyStore()
const userStore = useUserStore()

// Calculate current seller index

// Sort the seller queue to always have the current seller at the top
const sortedSellerQueue = computed(() => {
  if (!lobbyStore.lobby?.sellerQueue || !lobbyStore.lobby.sellerQueue.length) {
    return []
  }

  const queue = [...lobbyStore.lobby.sellerQueue]
  const currentIndex = lobbyStore.sellerIndex

  // Reorder the array to have the current seller first
  return [...queue.slice(currentIndex), ...queue.slice(0, currentIndex)]
})
</script>
