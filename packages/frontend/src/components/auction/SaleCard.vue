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
  <div class="bg-gray-800 w-full p-3 lg:p-6 rounded-lg shadow-lg h-full flex flex-col">
    <!-- Header Section -->
    <div class="flex items-center justify-between mb-3 lg:mb-5">
      <h2 class="text-lg lg:text-2xl font-bold text-white flex items-center">
        <span class="mr-2">📦</span> Sell Items
      </h2>
      <div class="bg-gray-700 px-2 py-1 lg:px-3 lg:py-1.5 rounded-full">
        <span class="text-green-400 text-sm lg:text-base font-medium">Your Turn</span>
      </div>
    </div>

    <!-- Item Selection Section -->
    <div
      class="bg-gray-700 p-3 lg:p-5 rounded-lg mb-3 lg:mb-5 flex-grow overflow-auto min-h-[200px]"
    >
      <InventorySelector
        :details="details"
        :items="saleQuantities?.items ?? []"
        class="w-full bg-transparent text-gray-400"
      >
        <template #header>
          <p class="text-gray-300 mb-3 text-sm lg:text-base font-medium">Select items to sell:</p>
        </template>
      </InventorySelector>
    </div>

    <!-- Action Section -->
    <div class="flex flex-col gap-2 mt-auto">
      <button
        :class="
          hasSelectedItems
            ? 'bg-green-500 hover:bg-green-600 active:bg-green-700 text-white transform active:scale-95'
            : 'bg-gray-600 text-gray-400 cursor-not-allowed'
        "
        :disabled="!hasSelectedItems"
        class="w-full py-3 px-4 rounded-md font-semibold text-base lg:text-lg transition-all shadow-md"
        @click="emits('sale', saleQuantities?.items)"
      >
        Submit Sale
      </button>

      <!-- Helper Text -->
      <p v-if="!hasSelectedItems" class="text-center text-gray-400 text-xs lg:text-sm">
        Select at least one item to sell
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
