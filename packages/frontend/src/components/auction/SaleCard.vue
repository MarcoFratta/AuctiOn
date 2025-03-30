<script lang="ts" setup>
import InventorySelector from '@/components/InventorySelector.vue'
import { computed, ref } from 'vue'
import { useLobbyStore } from '@/stores/lobbyStore.ts'
import BaseCard from '@/components/BaseCard.vue'
import LoadingButton from '@/components/LoadingButton.vue'
import type { ItemQuantity } from '@/schemas/LobbySchema.ts'

const lobbyStore = useLobbyStore()
const startingItems =
  lobbyStore.lobby?.startInventory.items.map((i) => {
    return { ...i, quantity: 0 }
  }) || []

// Use ref instead of reactive to avoid deep reactivity issues
const items = ref(startingItems)

const details = computed(() => {
  return new Map(
    lobbyStore.playerInfo?.inventory.items.map((item) => [
      item.item,
      {
        min: 0,
        max: item.quantity,
      },
    ]),
  )
})

const isLoading = ref(false)
const emits = defineEmits(['sale', 'update:items'])

// Handle updates from the InventorySelector
const updateItems = (newItems: ItemQuantity[]) => {
  items.value = newItems
  // Only emit items with quantity > 0
  const itemsToSell = items.value.filter((i) => i.quantity > 0)
  emits('update:items', itemsToSell)
}

const createSale = () => {
  isLoading.value = true
  const itemsToSell = items.value.filter((i) => i.quantity > 0)
  emits('sale', itemsToSell)
  setTimeout(() => {
    isLoading.value = false
  }, 1000)
}

const canCreateSale = computed(() => {
  return items.value.some((i) => i.quantity > 0)
})
</script>

<template>
  <BaseCard class="h-full flex flex-col">
    <!-- Header -->
    <div class="flex items-center gap-2">
      <div class="bg-green-100 dark:bg-green-500/20 px-1.5 md:p-2 rounded-lg">
        <svg
          class="h-4 w-4 md:h-5 md:w-5 text-green-500 dark:text-green-400"
          fill="currentColor"
          viewBox="0 0 20 20"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            clip-rule="evenodd"
            d="M10 2a4 4 0 00-4 4v1H5a1 1 0 00-.994.89l-1 9A1 1 0 004 18h12a1 1 0 00.994-1.11l-1-9A1 1 0 0015 7h-1V6a4 4 0 00-4-4zm2 5V6a2 2 0 10-4 0v1h4zm-6 3a1 1 0 112 0 1 1 0 01-2 0zm7-1a1 1 0 100 2 1 1 0 000-2z"
            fill-rule="evenodd"
          />
        </svg>
      </div>
      <h2 class="text-lg md:text-xl font-semibold text-zinc-900 dark:text-white">Create Sale</h2>
    </div>

    <!-- Main Content -->
    <div class="flex-grow flex flex-col">
      <!-- Inventory Selector -->
      <div class="inventory-selector flex-grow mb-3 md:mb-4">
        <InventorySelector
          :details="details"
          :items="items"
          class="bg-white dark:bg-neutral-800 rounded-lg border border-gray-200 dark:border-gray-700/50 p-2 md:p-3 h-full"
          @update:items="updateItems"
        />
      </div>

      <!-- Create Sale Button -->
      <div class="mt-auto">
        <LoadingButton
          :disable="!canCreateSale"
          :loading="isLoading"
          class="w-full font-medium text-xs md:text-sm transition-colors"
          @click="canCreateSale && createSale()"
        >
          Create Sale
        </LoadingButton>

        <!-- Helper text -->
        <p
          v-if="!canCreateSale"
          class="text-center text-gray-500 dark:text-gray-400 text-xs mt-1.5"
        >
          Select at least one item to sell
        </p>
      </div>
    </div>
  </BaseCard>
</template>

<style scoped>
.inventory-selector :deep(.quantity-input) {
  width: 3rem;
  padding: 0.25rem 0.5rem;
  border-radius: 0.375rem;
  border: 1px solid rgba(209, 213, 219, 0.5);
  background-color: white;
  color: rgb(17, 24, 39); /* text-gray-900 */
}

.dark .inventory-selector :deep(.quantity-input) {
  background-color: rgba(31, 41, 55, 0.6); /* bg-gray-800/60 */
  border-color: rgba(75, 85, 99, 0.5); /* border-gray-700/50 */
  color: white;
}

.inventory-selector :deep(.quantity-input:focus) {
  border-color: rgb(139, 92, 246); /* border-app-violet-500 */
  box-shadow: 0 0 0 1px rgb(139, 92, 246); /* ring-1 ring-app-violet-500 */
  outline: none;
}

/* Fix inventory item icons */
.inventory-selector :deep(svg) {
  width: 1.25rem;
  height: 1.25rem;
}

@media (min-width: 768px) {
  .inventory-selector :deep(svg) {
    width: 1.5rem;
    height: 1.5rem;
  }
}
</style>
