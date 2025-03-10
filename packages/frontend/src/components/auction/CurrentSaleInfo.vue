<script lang="ts" setup>
import { useLobbyStore } from '@/stores/lobbyStore.ts'
import { computed } from 'vue'

const lobbyStore = useLobbyStore()
const currentSale = computed(() => lobbyStore.lobby?.currentSale)
</script>

<template>
  <div class="bg-gray-800 p-4 lg:p-6 rounded-lg shadow-lg h-full">
    <div class="flex items-center justify-between mb-4">
      <h2 class="text-xl font-bold text-white">📦 Current Sale</h2>
      <div class="bg-gray-700 px-3 py-1 rounded-full">
        <span class="text-gray-400"
          >Status:
          <span class="text-yellow-400 font-bold">
            {{ currentSale ? 'Active' : 'Waiting' }}
          </span>
        </span>
      </div>
    </div>

    <!-- Sale Information -->
    <div v-if="currentSale" class="bg-gray-700 p-4 rounded-lg">
      <div class="space-y-3">
        <div class="flex justify-between items-center">
          <span class="text-gray-400">Total Weight:</span>
          <span class="text-orange-400 font-bold">{{ currentSale.info.weight }}</span>
        </div>
        <div class="flex justify-between items-center">
          <span class="text-gray-400">Seller:</span>
          <span class="text-blue-400">
            {{ lobbyStore.users.find((p) => p.id === currentSale?.sellerId)?.username ?? '' }}
          </span>
        </div>
      </div>
    </div>

    <!-- No Sale State -->
    <div v-else class="bg-gray-700 p-4 rounded-lg text-center">
      <p class="text-gray-400">Waiting for next sale...</p>
    </div>
  </div>
</template>
