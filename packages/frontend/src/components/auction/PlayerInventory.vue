<script lang="ts" setup>
import { useLobbyStore } from '@/stores/lobbyStore.ts'
import { computed } from 'vue'
import { shapeIcons, type ShapeType } from '@/icons/shapes'
import InventoryItem from '@/components/auction/InventoryItem.vue'

const lobbyStore = useLobbyStore()
const playerInfo = computed(() => lobbyStore.playerInfo)

// Function to get shape and color based on item name
const getItemStyle = (itemName: string) => {
  const styleMap: Record<ShapeType, { svg: string; color: string }> = {
    circle: { svg: shapeIcons.circle, color: 'fill-blue-500' },
    square: { svg: shapeIcons.square, color: 'fill-red-500' },
    triangle: { svg: shapeIcons.triangle, color: 'fill-green-500' },
  }

  return styleMap[itemName.toLowerCase() as ShapeType] || styleMap['circle']
}
</script>

<template>
  <!-- Player Inventory & Money -->
  <div class="bg-gray-800 w-full p-3 sm:p-4 lg:p-6 rounded-lg shadow-lg">
    <!-- Updated header layout -->
    <div
      class="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 sm:gap-3 mb-3 sm:mb-4"
    >
      <h2 class="text-lg sm:text-xl font-bold text-white">🎒 Your Inventory</h2>
      <div class="bg-gray-700 px-3 sm:px-4 py-1 sm:py-2 rounded-md shrink-0">
        <span class="text-gray-400"
          >💰: <span class="text-green-400 font-bold">${{ playerInfo?.money || 0 }}</span></span
        >
      </div>
    </div>
    <div class="bg-gray-700 p-4 sm:p-2 md:p-3 lg:p-4 rounded-lg">
      <ul class="grid grid-cols-1 gap-3">
        <li
          v-for="item in playerInfo?.inventory.items"
          :key="item.item"
          class="flex items-center justify-between bg-gray-800 p-1 rounded"
        >
          <InventoryItem :item="item" />
        </li>
      </ul>
    </div>

    <!-- Empty inventory message -->
    <p v-if="!playerInfo?.inventory.items?.length" class="text-gray-400 text-center p-4">
      Your inventory is empty.
    </p>
  </div>
</template>

<style scoped>
svg {
  width: 100%;
  height: 100%;
}
</style>
