<script lang="ts" setup>
import InventorySelector from '@/components/InventorySelector.vue'
import { computed, ref, watch } from 'vue'
import { useLobbyStore } from '@/stores/lobbyStore.ts'

const lobbyStore = useLobbyStore()
const startingItems = lobbyStore.lobby?.startInventory.items.map((i) => {
  return { ...i, quantity: 0 }
})
const saleQuantities = ref({ items: startingItems })
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
const emits = defineEmits(['sale', 'update:items'])
watch(
  () => saleQuantities,
  () => {
    emits('update:items', saleQuantities.value.items)
  },
  { deep: true },
)

const hasSelectedItems = computed(() => {
  return saleQuantities?.value?.items?.some((item) => item.quantity > 0) ?? false
})
</script>

<template>
  <div class="bg-gray-800 w-full p-4 lg:p-6 rounded-lg shadow-lg">
    <!-- Header Section -->
    <div class="flex items-center justify-between mb-4">
      <h2 class="text-xl font-bold text-white">📦 Sell</h2>
      <div class="bg-gray-700 px-3 py-1 rounded-full">
        <span class="text-gray-400"><span class="text-green-400">Your Turn</span></span>
      </div>
    </div>

    <!-- Item Selection Section -->
    <div class="bg-gray-700 p-4 rounded-lg mb-4">
      <InventorySelector
        :details="details"
        :items="saleQuantities?.items ?? []"
        class="w-full bg-transparent text-gray-400"
      >
        <template #header>
          <p class="text-gray-400 mb-3">Select the items you want to sell in this round:</p>
        </template>
      </InventorySelector>
    </div>

    <!-- Action Section -->
    <div class="flex flex-col gap-2">
      <button
        :class="
          hasSelectedItems
            ? 'bg-green-500 hover:bg-green-600 text-white'
            : 'bg-gray-600 text-gray-400 cursor-not-allowed'
        "
        :disabled="!hasSelectedItems"
        class="w-full py-3 px-4 rounded-md font-semibold text-lg transition-all"
        @click="emits('sale', saleQuantities?.items)"
      >
        Submit Sale
      </button>

      <!-- Helper Text -->
      <p v-if="!hasSelectedItems" class="text-center text-gray-400 text-sm">
        Select at least one item to submit sale
      </p>
    </div>
  </div>
</template>

<style scoped>
.inventory-selector :deep(.quantity-input) {
  background-color: rgb(31, 41, 55); /* bg-gray-800 */
  border-color: rgb(75, 85, 99); /* border-gray-600 */
  color: white;
}

.inventory-selector :deep(.quantity-input:focus) {
  border-color: rgb(59, 130, 246); /* border-blue-500 */
  box-shadow: 0 0 0 1px rgb(59, 130, 246); /* ring-1 ring-blue-500 */
  outline: none;
}
</style>
