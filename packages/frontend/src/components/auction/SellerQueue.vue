<template>
  <div class="bg-gray-800 w-full p-4 lg:p-6 rounded-lg shadow-lg">
    <h2 class="text-lg font-semibold mb-3">🔄 Seller Queue</h2>
    <div class="overflow-hidden">
      <ul class="grid gap-3">
        <li
          v-for="(sellerId, index) in sortedSellerQueue"
          :key="sellerId"
          :class="{
            'bg-gray-700 border-l-4 border-yellow-400': index === 0,
            'bg-gray-700': index !== 0,
          }"
          class="flex items-center p-3 rounded-md transition-all"
        >
          <div class="flex items-center w-full">
            <!-- Status Dot -->
            <span
              :class="
                lobbyStore.users.find((p) => p.id === sellerId)?.connected
                  ? 'bg-green-400'
                  : 'bg-red-500'
              "
              class="w-3 h-3 rounded-full mr-3"
            ></span>

            <!-- Username -->
            <span class="text-white flex-grow">
              {{ lobbyStore.users.find((p) => p.id === sellerId)?.username ?? 'Unknown' }}
            </span>

            <!-- Status Tags -->
            <div class="flex items-center space-x-2">
              <!-- "You" Tag -->
              <span
                v-if="sellerId === userStore?.user?.id"
                class="px-2 py-0.5 bg-gray-600 text-yellow-400 text-xs rounded-full"
              >
                You
              </span>

              <!-- Current/Next Tags -->
              <span
                v-if="index === 0"
                class="px-2 py-0.5 bg-yellow-500 bg-opacity-20 text-gray-600 text-xs rounded-full"
              >
                Current
              </span>
              <span
                v-else-if="index === 1"
                class="px-2 py-0.5 bg-blue-500 bg-opacity-20 text-white text-xs rounded-full"
              >
                Next
              </span>
            </div>
          </div>
        </li>
      </ul>
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
