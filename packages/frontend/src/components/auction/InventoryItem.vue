<script lang="ts" setup>
import { useLobbyStore } from '@/stores/lobbyStore.ts'
import { computed } from 'vue'
import GameShapes from '@/components/icons/GameShapes.vue'
import AppIcons from '@/components/icons/AppIcons.vue'

const props = defineProps<{
  item: {
    item: string
    quantity: number
  }
}>()

const lobbyStore = useLobbyStore()

// Calculate the total weight of this item
const totalWeight = computed(() => {
  const weight = lobbyStore.weights.find((w) => w.item === props.item.item)?.weight || 0
  return weight * props.item.quantity
})

// Get the individual weight of this item
const itemWeight = computed(() => {
  return lobbyStore.weights.find((w) => w.item === props.item.item)?.weight || 0
})
</script>

<template>
  <div
    class="flex w-full items-center justify-between bg-white dark:bg-neutral-800 p-1 rounded-lg border border-gray-100 dark:border-neutral-700/50 transition-all hover:shadow-sm"
  >
    <!-- Left side: Item icon and name -->
    <div class="flex items-center gap-2">
      <div class="w-6 h-6 flex-shrink-0 flex items-center justify-center">
        <GameShapes :type="item.item" class="text-violet-500 dark:text-app-violet-400" size="sm" />
      </div>
      <div class="flex flex-col justify-center">
        <span class="text-gray-900 dark:text-white text-xs font-medium capitalize">{{
          item.item
        }}</span>
        <div class="flex items-center text-xs text-gray-500 dark:text-gray-400">
          <AppIcons class="mr-0.5" color="orange" name="weight" size="xs" />
          <span class="font-medium text-xs text-orange-600 dark:text-orange-400">{{
            itemWeight
          }}</span>
        </div>
      </div>
    </div>

    <!-- Right side: Quantity and total weight with labels -->
    <div class="flex items-center gap-2">
      <div class="flex flex-col items-center">
        <div class="text-[10px] text-gray-500 dark:text-gray-400 mb-0.5">QTY</div>
        <div
          class="bg-violet-50 dark:bg-app-violet-500/10 px-1.5 py-0.5 rounded text-xs font-medium text-violet-700 dark:text-app-violet-300 min-w-[1.75rem] text-center"
        >
          {{ item.quantity }}
        </div>
      </div>

      <div class="flex flex-col items-center">
        <div class="text-[10px] text-gray-500 dark:text-gray-400 mb-0.5">TW</div>
        <div
          class="bg-orange-50 dark:bg-orange-500/10 px-1.5 py-0.5 rounded text-xs font-medium text-orange-600 dark:text-orange-400 min-w-[1.75rem] text-center"
        >
          {{ totalWeight }}
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Optional: Add a subtle hover effect */
.flex:hover {
  background-color: rgba(249, 250, 251, 0.5);
}

.dark .flex:hover {
  background-color: rgba(38, 38, 38, 0.5);
}
</style>
