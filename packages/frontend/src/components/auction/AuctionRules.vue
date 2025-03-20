<script lang="ts" setup>
import { useLobbyStore } from '@/stores/lobbyStore.ts'
import InventoryItem from '@/components/auction/InventoryItem.vue'
import { computed } from 'vue'

const lobbyStore = useLobbyStore()

// Sort weights by value for better visualization
const sortedWeights = computed(() => {
  return [...lobbyStore.weights].sort((a, b) => b.weight - a.weight)
})
</script>

<template>
  <div class="bg-gray-800 p-3 rounded-lg shadow-lg h-full flex flex-col">
    <!-- Header -->
    <div class="flex items-center justify-between mb-4">
      <h2 class="text-lg font-bold text-white flex items-center">
        <span class="mr-2">📋</span> Rules
      </h2>
      <div class="bg-blue-500/10 px-2.5 py-1 rounded-full border border-blue-400/30">
        <span class="text-blue-400 text-xs font-medium">Round Rules</span>
      </div>
    </div>

    <!-- Main Content -->
    <div class="bg-gray-700 p-2 rounded-lg flex-grow flex justify-between flex-col overflow-auto">
      <!-- Bid Timer Section -->
      <div class="bg-gray-750 rounded-lg p-2">
        <div class="flex items-center">
          <div
            class="bg-purple-500/10 p-2.5 rounded-lg border border-purple-400/20 mr-3 flex-shrink-0 flex items-center justify-center"
          >
            <svg
              class="h-6 w-6 text-purple-300"
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
          <div>
            <div class="text-white text-sm font-medium">Bid Timer</div>
            <div class="flex items-center mt-1">
              <span class="text-white text-lg font-medium">{{
                lobbyStore.lobby?.bidTime ?? ''
              }}</span>
              <span class="text-blue-300 text-base ml-1.5">seconds</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Weights Section -->
      <div class="bg-gray-750 rounded-lg p-2">
        <div class="flex items-center mb-3">
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
          <div>
            <div class="text-white text-sm font-medium">Item Weights</div>
            <div class="text-blue-200 text-xs mt-1">Highest first</div>
          </div>
        </div>

        <!-- Weight Items List -->
        <div class="space-y-2">
          <div
            v-for="item in sortedWeights"
            :key="item.item"
            class="bg-gray-800 rounded-lg transition-all hover:bg-gray-700"
          >
            <InventoryItem :item="item" class="custom-inventory-item" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
:deep(.custom-inventory-item) {
  background: transparent;
  border-radius: 0.5rem;
  padding: 0.5rem 0.75rem;
}

:deep(.custom-inventory-item svg) {
  width: 1.5rem;
  height: 1.5rem;
}
</style>
