<script lang="ts" setup>
import { computed } from 'vue'
import { useLobbyStore } from '@/stores/lobbyStore.ts'
import BaseCard from '@/components/common/BaseCard.vue'
import InnerCard from '@/components/common/InnerCard.vue'

const props = defineProps<{
  items: {
    item: string
    quantity: number
  }[]
}>()

const lobbyStore = useLobbyStore()

// Calculate total weight of selected items
const totalWeight = computed(() => {
  return props.items
    .filter((item) => item.quantity > 0)
    .reduce((acc, item) => {
      const weight = lobbyStore.weights.find((w) => w.item === item.item)?.weight || 0
      return acc + weight * item.quantity
    }, 0)
})

// Check if any items are selected
const hasSelectedItems = computed(() => {
  return props.items.some((item) => item.quantity > 0)
})
</script>

<template>
  <BaseCard class="h-full flex flex-col">
    <!-- Header with consistent styling -->
    <div class="flex items-center gap-2 mb-4">
      <div class="bg-indigo-100 dark:bg-app-fuchsia-500/20 p-2 rounded-lg">
        <svg
          class="h-5 w-5 text-indigo-500 dark:text-app-fuchsia-300"
          fill="currentColor"
          viewBox="0 0 20 20"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
          />
        </svg>
      </div>
      <h2 class="text-xl font-semibold text-zinc-900 dark:text-white">Sale Preview</h2>
    </div>

    <!-- Content Container with Fixed Height -->
    <InnerCard class="flex-grow flex flex-col justify-center min-h-[180px]">
      <!-- Total Weight (when items selected) -->
      <div
        v-if="hasSelectedItems"
        class="bg-indigo-50 dark:bg-neutral-800 p-4 rounded-lg border border-indigo-100 dark:border-app-fuchsia-500/20"
      >
        <div class="flex flex-col">
          <div class="flex justify-between items-center mb-2">
            <span class="text-gray-700 dark:text-gray-300 text-sm font-medium">Total Value</span>
            <div
              class="bg-white dark:bg-gray-800/80 px-3 py-1 rounded-md border border-indigo-200 dark:border-app-fuchsia-500/30"
            >
              <span class="text-indigo-600 dark:text-app-fuchsia-300 font-bold text-lg">{{
                totalWeight
              }}</span>
            </div>
          </div>

          <!-- Sale status indicator -->
          <div
            class="flex items-center mt-2 bg-green-50 dark:bg-green-500/10 p-2 rounded-md border border-green-100 dark:border-green-500/20"
          >
            <svg
              class="h-4 w-4 text-green-500 dark:text-green-400 mr-2"
              fill="currentColor"
              viewBox="0 0 20 20"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                clip-rule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                fill-rule="evenodd"
              />
            </svg>
            <span class="text-green-700 dark:text-green-300 text-sm">Ready to sell</span>
          </div>
        </div>
      </div>

      <!-- Empty State with consistent styling -->
      <div v-else class="flex flex-col items-center justify-center py-6">
        <div class="bg-gray-100 dark:bg-gray-700/50 p-4 rounded-full mb-3">
          <svg
            class="h-8 w-8 text-gray-500 dark:text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
            ></path>
          </svg>
        </div>
        <p class="text-gray-600 dark:text-gray-400 text-sm lg:text-base">
          Select items to see details
        </p>
      </div>
    </InnerCard>
  </BaseCard>
</template>
