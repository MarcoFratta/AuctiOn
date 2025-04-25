<script lang="ts" setup>
import { computed } from 'vue'
import GameShapes from '@/components/icons/GameShapes.vue'
import AppIcons from '@/components/icons/AppIcons.vue'
import { useInventoryUtils } from '@/composables/useInventoryUtils.ts'
import ValueBadge from '@/components/common/ValueBadge.vue'

const props = defineProps<{
  item: {
    item: string
    quantity: number
  }
}>()

const { getItemWeight, getCollectionGain } = useInventoryUtils()

// Calculate the total weight of this item
const totalWeight = computed(() => {
  return getItemWeight(props.item.item) * props.item.quantity
})

// Get the individual weight of this item
const itemWeight = computed(() => {
  return getItemWeight(props.item.item)
})

// Calculate the collection gain for this item
const collectionGain = computed(() => {
  return getCollectionGain(props.item.item, props.item.quantity)
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

    <!-- Right side: Quantity, total weight, and collection gain -->
    <div class="flex items-center gap-2">
      <div class="flex flex-col items-center">
        <div class="text-[10px] text-gray-500 dark:text-gray-400 mb-0.5">QTY</div>
        <ValueBadge :value="item.quantity" color-theme="violet" tooltip="Quantity" />
      </div>

      <div class="flex flex-col items-center">
        <div class="text-[10px] text-gray-500 dark:text-gray-400 mb-0.5">TW</div>
        <ValueBadge :value="totalWeight" color-theme="orange" tooltip="Total Weight" />
      </div>

      <div class="flex flex-col items-center">
        <div class="text-[10px] text-gray-500 dark:text-gray-400 mb-0.5">CB</div>
        <ValueBadge
          :value="`$${collectionGain}`"
          color-theme="emerald"
          tooltip="Collection Bonus"
        />
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
