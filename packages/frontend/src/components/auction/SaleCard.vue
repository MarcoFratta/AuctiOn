<script lang="ts" setup>
import InventorySelector from '@/components/common/InventorySelector.vue'
import { computed, ref } from 'vue'
import { useLobbyStore } from '@/stores/lobbyStore.ts'
import BaseCard from '@/components/common/BaseCard.vue'
import LoadingButton from '@/components/common/LoadingButton.vue'
import AppIcons from '@/components/icons/AppIcons.vue'
import { useStatsCreator } from '@/composables/useStatsCreator.ts'
import type { ItemQuantity } from '@/schemas/LobbySchema.ts'
import InnerCard from '@/components/common/InnerCard.vue'

const lobbyStore = useLobbyStore()
const { avgDollarPerWeight } = useStatsCreator()
const startingItems = lobbyStore.lobby!.startInventory.items.map((i) => {
  return { ...i, quantity: 0 }
})

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

// Calculate total weight of selected items
const totalWeight = computed(() => {
  return items.value
    .filter((item) => item.quantity > 0)
    .reduce((acc, item) => {
      const weight = lobbyStore.weights.find((w) => w.item === item.item)?.weight || 0
      return acc + weight * item.quantity
    }, 0)
})

// Calculate estimated sale price based on average dollar per weight
const estimatedPrice = computed(() => {
  return Math.round(totalWeight.value * avgDollarPerWeight.value)
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

// Calculate percentage of inventory being sold (by weight)
const inventoryPercentageSold = computed(() => {
  const currentTotalWeight =
    lobbyStore.playerInfo?.inventory.items.reduce((acc, item) => {
      const weight = lobbyStore.weights.find((w) => w.item === item.item)?.weight || 0
      return acc + weight * item.quantity
    }, 0) || 0

  if (currentTotalWeight === 0) return 0
  return Math.round((totalWeight.value / currentTotalWeight) * 100)
})
</script>

<template>
  <BaseCard class="h-full flex flex-col">
    <!-- Header -->
    <div class="flex items-center justify-start mb-2">
      <div class="flex items-center gap-1.5">
        <div class="bg-green-100 dark:bg-green-500/20 p-1 rounded-lg">
          <AppIcons color="green" name="create-sale" size="sm" />
        </div>
        <h2 class="text-sm md:text-base font-semibold text-zinc-900 dark:text-white">Sell</h2>
      </div>
    </div>

    <div class="overflow-y-auto">
      <InventorySelector
        :details="details"
        :items="[items[0], ...items.slice(1)]"
        @update:items="updateItems"
      />
    </div>

    <!-- Create Sale Button with Stats -->
    <div class="mt-2 space-y-2">
      <LoadingButton
        :disable="!canCreateSale"
        :loading="isLoading"
        class="w-full font-medium text-xs transition-colors"
        @click="canCreateSale && createSale()"
      >
        {{ !canCreateSale ? 'Select at least one item to sell' : 'Create Sale' }}
      </LoadingButton>
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

/* Hide scrollbar for Chrome, Safari and Opera */
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}

/* Hide scrollbar for IE, Edge and Firefox */
.scrollbar-hide {
  -ms-overflow-style: none; /* IE and Edge */
  scrollbar-width: none; /* Firefox */
}
</style>
