<script lang="ts" setup>
import StatDisplay from '@/components/common/StatDisplay.vue'
import { BalanceSlider } from '@/components/ui/balance-slider'
import AppIcons from '@/components/icons/AppIcons.vue'

defineProps<{
  totalWeight: number
  estimatedPrice: number
  remainingWeight: number
  currentTotalWeight: number
  inventoryPercentageSold: number
  isDark: boolean
  hasSelectedItems: boolean
}>()
</script>

<template>
  <div v-if="hasSelectedItems" class="flex flex-col h-full justify-start overflow-y-auto">
    <!-- Sale Stats -->
    <div class="grid grid-cols-2 gap-2 mb-3">
      <StatDisplay
        prefix=""
        :value="totalWeight"
        title="Selected Weight"
        valueColor="text-orange-600 dark:text-orange-400"
      />
      <StatDisplay
        prefix="$"
        :show-percentage="false"
        :value="estimatedPrice"
        title="Estimated Price"
        valueColor="text-app-fuchsia-600 dark:text-app-fuchsia-400"
      />
    </div>

    <!-- Weight Comparison Visualization -->
    <div
      class="bg-white dark:bg-neutral-800 p-2 rounded-lg border border-neutral-100 dark:border-neutral-700/50"
    >
      <div class="flex items-center justify-between mb-2">
        <span class="text-xs font-medium text-indigo-700 dark:text-app-fuchsia-300"
          >Inventory Weight</span
        >
        <span class="text-xs text-indigo-600 dark:text-app-fuchsia-400">
          {{ remainingWeight }} / {{ currentTotalWeight }}
        </span>
      </div>
      <BalanceSlider
        :dark-mode="isDark"
        :indicator-color="isDark ? '#ffffff' : '#000000'"
        :value="inventoryPercentageSold"
        left-color="#CC00FF"
        left-content="Selling"
        left-text-color="rgb(192, 38, 211)"
        right-color="#8C33FF"
        right-content="Remaining"
        right-text-color="rgb(139, 92, 246)"
      />
    </div>
  </div>

  <!-- Empty State -->
  <div v-else class="flex flex-col items-center justify-center h-full py-3">
    <div class="bg-neutral-100 dark:bg-neutral-700/50 p-2 rounded-full mb-2">
      <AppIcons color="gray" name="info" size="sm" />
    </div>
    <p class="text-neutral-600 dark:text-neutral-400 text-xs">Select items to see details</p>
  </div>
</template>
