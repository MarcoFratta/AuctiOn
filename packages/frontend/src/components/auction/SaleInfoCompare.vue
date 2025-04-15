<script lang="ts" setup>
import { computed } from 'vue'
import GameShapes from '@/components/icons/GameShapes.vue'
import AppIcons from '@/components/icons/AppIcons.vue'
import ValueBadge from '@/components/common/ValueBadge.vue'
import type { ItemQuantity } from '@/schemas/LobbySchema.ts'
import { useLobbyStore } from '@/stores/lobbyStore.ts'
import ScrollableContainer from '@/components/common/ScrollableContainer.vue'

const props = defineProps<{
  selectedItems: { item: string; quantity: number }[]
  inventoryItems: ItemQuantity[]
  remainingWeight: number
  currentTotalWeight: number
  remainingItemsCount: number
  totalItemsCount: number
  hasSelectedItems: boolean
}>()

const lobbyStore = useLobbyStore()
// --- Local Logic ---
const weights = computed(() => lobbyStore.weights)
// Get weight for a specific item
const getItemWeight = (itemName: string): number => {
  return weights.value.find((w) => w.item === itemName)?.weight || 0
}

// Calculate remaining quantity after sale for a specific inventory item
const getAfterQuantity = (inventoryItem: ItemQuantity): number => {
  const selectedQuantity =
    props.selectedItems.find((i) => i.item === inventoryItem.item)?.quantity || 0
  return Math.max(0, inventoryItem.quantity - selectedQuantity)
}

// Filter inventory items to only show those included in the sale
const itemsToCompare = computed(() => {
  const selectedItemNames = new Set(props.selectedItems.map((i) => i.item))
  return props.inventoryItems.filter((invItem) => selectedItemNames.has(invItem.item))
})

// Determine the color theme for the 'After' badges
const getAfterTheme = (
  item: ItemQuantity,
  type: 'quantity' | 'weight',
): 'red' | 'violet' | 'orange' => {
  const afterQty = getAfterQuantity(item)
  const isReduced = afterQty < item.quantity
  if (isReduced) return 'red'
  return type === 'quantity' ? 'violet' : 'orange'
}
</script>

<template>
  <div v-if="hasSelectedItems" class="flex flex-col h-full">
    <!-- Summary Stats -->
    <div class="flex items-center justify-between mb-2 text-xs">
      <div class="flex items-center">
        <span class="text-neutral-500 dark:text-neutral-400 mr-1">Remaining Weight:</span>
        <span class="font-bold text-orange-600 dark:text-orange-400">
          {{ remainingWeight }} / {{ currentTotalWeight }}
        </span>
      </div>
      <div class="flex items-center">
        <span class="text-neutral-500 dark:text-neutral-400 mr-1">Remaining Items:</span>
        <span class="font-bold text-neutral-900 dark:text-white">
          {{ remainingItemsCount }} / {{ totalItemsCount }}
        </span>
      </div>
    </div>

    <!-- Inventory Comparison Table -->
    <div
      class="flex-grow overflow-auto scrollbar-hide border border-neutral-100 dark:border-neutral-700/50 rounded-lg"
    >
      <!-- Table Header -->
      <div
        class="sticky top-0 z-10 bg-neutral-50 dark:bg-neutral-900 p-2 border-b border-neutral-100 dark:border-neutral-700/50 flex text-xs font-medium dark:text-neutral-400"
      >
        <div class="w-1/3">Item</div>
        <div class="w-2/3 flex justify-end">
          <div class="text-right pr-12">Before</div>
          <div class="pr-3">After</div>
        </div>
      </div>

      <!-- Table Body -->
      <div
        class="divide-y divide-neutral-100 dark:divide-neutral-800 overflow-y-auto scrollbar-hide"
      >
        <ScrollableContainer show-scroll-indicator>
          <div
            v-for="item in itemsToCompare"
            :key="item.item"
            class="flex p-2 bg-white dark:bg-neutral-800 text-xs"
          >
            <!-- Item -->
            <div class="w-1/3 flex items-center">
              <div class="w-4 h-4 flex-shrink-0 flex items-center justify-center mr-1.5">
                <GameShapes
                  :type="item.item"
                  class="text-violet-500 dark:text-app-violet-400"
                  size="xs"
                />
              </div>
              <span class="text-neutral-800 dark:text-neutral-200 capitalize truncate">{{
                item.item
              }}</span>
            </div>

            <!-- Right side container -->
            <div class="w-2/3 flex justify-end items-center">
              <!-- Before and Arrow -->
              <div class="flex items-center justify-end">
                <div class="flex items-center space-x-1">
                  <!-- Use ValueBadge for Before Quantity -->
                  <ValueBadge :value="item.quantity" color-theme="violet" />
                  <!-- Use ValueBadge for Before Weight -->
                  <ValueBadge
                    :value="getItemWeight(item.item) * item.quantity"
                    color-theme="orange"
                  />
                </div>

                <!-- Transition Arrow -->
                <svg
                  class="h-3 w-3 text-neutral-400 dark:text-neutral-500 mx-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M9 5l7 7-7 7"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                  ></path>
                </svg>
              </div>

              <!-- After -->
              <div class="flex items-center">
                <div class="flex items-center space-x-1">
                  <!-- Use ValueBadge for After Quantity -->
                  <ValueBadge
                    :color-theme="getAfterTheme(item, 'quantity')"
                    :value="getAfterQuantity(item)"
                  />
                  <!-- Use ValueBadge for After Weight -->
                  <ValueBadge
                    :color-theme="getAfterTheme(item, 'weight')"
                    :value="getItemWeight(item.item) * getAfterQuantity(item)"
                  />
                </div>
              </div>
            </div>
          </div>
        </ScrollableContainer>
      </div>
    </div>
  </div>

  <!-- Empty State -->
  <div v-else class="flex flex-col items-center justify-center h-full py-3">
    <div class="bg-neutral-100 dark:bg-neutral-700/50 p-2 rounded-full mb-2">
      <AppIcons name="info" size="sm" color="gray" />
    </div>
    <p class="text-neutral-600 dark:text-neutral-400 text-xs">Select items to see details</p>
  </div>
</template>
