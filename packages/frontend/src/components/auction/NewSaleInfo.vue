<script lang="ts" setup>
import { computed } from 'vue'
import { useLobbyStore } from '@/stores/lobbyStore.ts'

const props = defineProps<{
  currentSale: {
    item: string
    quantity: number
  }[]
}>()
const lobbyStore = useLobbyStore()
const totalWeight = computed(() => {
  return props.currentSale.reduce(
    (acc, item) =>
      acc + item.quantity * (lobbyStore.weights.find((i) => i.item === item.item)?.weight ?? 0),
    0,
  )
})
</script>

<template>
  <div class="bg-gray-800 p-4 lg:p-6 rounded-lg shadow-lg h-full">
    <div class="flex items-center justify-between mb-4">
      <h2 class="text-xl font-bold text-white">📦 Sale details</h2>
    </div>

    <!-- Sale Information -->
    <div v-if="currentSale" class="bg-gray-700 p-4 rounded-lg">
      <div class="space-y-3">
        <div class="flex justify-between items-center">
          <span class="text-gray-400">Total Weight:</span>
          <span class="text-orange-400 font-bold">{{ totalWeight }}</span>
        </div>
      </div>
    </div>

    <!-- No Sale State -->
    <div v-else class="bg-gray-700 p-4 rounded-lg text-center">
      <p class="text-gray-400">Waiting for next sale...</p>
    </div>
  </div>
</template>
