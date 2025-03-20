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
    <div class="flex items-center justify-between mb-3 lg:mb-5">
      <h2 class="text-lg lg:text-2xl font-bold text-white flex items-center">
        <span class="mr-2">📊</span> Sale Details
      </h2>
    </div>

    <!-- Sale Information -->
    <div v-if="currentSale" class="bg-gray-700 p-4 rounded-lg md:max-h-[150px] lg:max-h-none">
      <div class="space-y-3 flex flex-col justify-center h-full">
        <div class="flex justify-between items-center">
          <span class="text-gray-400 text-sm lg:text-lg">Total Weight:</span>
          <span class="text-orange-400 font-bold text-base lg:text-xl">{{ totalWeight }}</span>
        </div>
        <div class="flex justify-between items-center">
          <span class="text-gray-400 text-sm lg:text-lg">Items:</span>
          <span class="text-blue-400 text-sm lg:text-lg">
            {{ currentSale.filter((i) => i.quantity > 0).length }}
          </span>
        </div>
      </div>
    </div>

    <!-- No Sale State -->
    <div
      v-else
      class="bg-gray-700 p-4 rounded-lg md:max-h-[150px] lg:max-h-none flex items-center justify-center"
    >
      <p class="text-gray-400 text-sm lg:text-lg">Select items to see details</p>
    </div>
  </div>
</template>
