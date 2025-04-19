<script lang="ts" setup>
import { computed } from 'vue'
import { useLobbyStore } from '@/stores/lobbyStore.ts'
import { useStatsCreator } from '@/composables/useStatsCreator.ts'

// Use the stats creator directly with all the extracted calculations
const {
  recentMomentum,
  predictedSalePrice,
  priceVsPrediction,
  priceDifference,
  isAtRiskOfMostItems,
  priceTrendAnalysis,
  valueAssessment,
} = useStatsCreator()

const lobbyStore = useLobbyStore()

// Add computed properties for formatted values
const currentBid = computed(() => lobbyStore.lobby?.currentBid?.amount || 0)
const formattedCurrentBid = computed(() => `$${currentBid.value}`)
const formattedPredictedPrice = computed(() => `$${predictedSalePrice.value}`)
</script>

<template>
  <div
    class="absolute right-0 z-10 invisible opacity-0 group-hover:visible group-hover:opacity-100 transition-opacity duration-200 w-72 p-3 mt-2 bg-white dark:bg-neutral-800 rounded-lg shadow-lg border border-neutral-100 dark:border-neutral-700/50"
  >
    <!-- Inventory Risk Warning (only shown when applicable) -->
    <div
      v-if="isAtRiskOfMostItems"
      class="mb-3 p-2 bg-red-50 dark:bg-red-900/20 rounded border border-red-100 dark:border-red-800/30"
    >
      <p class="text-xs text-red-700 dark:text-red-400 font-medium">
        Warning: Winning this sale could give you the most items in the game, which would disqualify
        you from winning.
      </p>
    </div>

    <!-- Price Analysis -->
    <div class="mb-3">
      <h3 class="text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-2">
        Price Analysis
      </h3>

      <div class="flex justify-between text-xs mb-1">
        <span class="text-neutral-600 dark:text-neutral-400">Current bid:</span>
        <span class="font-medium text-neutral-800 dark:text-neutral-100">{{
          formattedCurrentBid
        }}</span>
      </div>

      <div class="flex justify-between text-xs mb-1">
        <span class="text-neutral-600 dark:text-neutral-400">Expected value:</span>
        <span class="font-medium text-neutral-800 dark:text-neutral-100">{{
          formattedPredictedPrice
        }}</span>
      </div>

      <div v-if="priceDifference !== 0" class="flex justify-between text-xs mb-2">
        <span class="text-neutral-600 dark:text-neutral-400">Difference:</span>
        <span
          :class="[
            priceDifference > 0
              ? 'text-red-600 dark:text-red-400'
              : 'text-green-600 dark:text-green-400',
            'font-medium',
          ]"
        >
          {{ priceDifference > 0 ? '+' : '' }}${{ Math.abs(priceDifference) }} ({{
            priceVsPrediction > 0 ? '+' : ''
          }}{{ priceVsPrediction }}%)
        </span>
      </div>

      <p class="text-xs text-neutral-700 dark:text-neutral-300 mt-1">
        {{ valueAssessment }}
      </p>
    </div>

    <!-- Market Trend Analysis - only shown when there are at least 2 bids -->
    <div v-if="currentBid" class="border-t border-neutral-100 dark:border-neutral-700 pt-2">
      <h3 class="text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">Market Trend</h3>

      <div v-if="recentMomentum !== 0" class="flex justify-between text-xs mb-1">
        <span class="text-neutral-600 dark:text-neutral-400">Recent momentum:</span>
        <span
          :class="[
            recentMomentum > 0
              ? 'text-red-600 dark:text-red-400'
              : 'text-green-600 dark:text-green-400',
            'font-medium',
          ]"
        >
          {{ recentMomentum > 0 ? '+' : '' }}{{ recentMomentum }}%
        </span>
      </div>

      <p class="text-xs text-neutral-700 dark:text-neutral-300">
        {{ priceTrendAnalysis }}
      </p>
    </div>
  </div>
</template>
