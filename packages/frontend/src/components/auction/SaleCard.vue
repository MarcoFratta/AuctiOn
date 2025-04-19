<script lang="ts" setup>
import InventorySelector from '@/components/common/InventorySelector.vue'
import { computed, ref } from 'vue'
import { useLobbyStore } from '@/stores/lobbyStore.ts'
import BaseCard from '@/components/common/BaseCard.vue'
import LoadingButton from '@/components/common/LoadingButton.vue'
import type { ItemQuantity } from '@/schemas/LobbySchema.ts'
import SectionHeader from '@/components/common/SectionHeader.vue'

const lobbyStore = useLobbyStore()
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
  items.value = startingItems
  emits('update:items', items)
  setTimeout(() => {
    isLoading.value = false
  }, 1000)
}

const canCreateSale = computed(() => {
  return items.value.some((i) => i.quantity > 0)
})
</script>

<template>
  <BaseCard class="h-full justify-start flex-grow">
    <!-- Replace the header with the new component -->
    <SectionHeader iconColor="green" iconName="create-sale" title="Sell"></SectionHeader>

    <!-- Content -->
    <div class="flex h-full flex-col overflow-y-auto scrollbar-hide">
      <!-- Inventory Selector - Make sure InnerCard passes height properly -->

      <InventorySelector
        :items="[items[0], ...items.slice(1)]"
        :details="details"
        @update:items="updateItems"
      />
    </div>
    <!-- Create Sale Button with Stats -->
    <div class="mt-3 space-y-2">
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
