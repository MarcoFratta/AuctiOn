<script lang="ts" setup>
import { useLobbyStore } from '@/stores/lobbyStore.ts'
import { computed } from 'vue'
import { shapeIcons, type ShapeType } from '@/icons/shapes'

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

    <ul class="grid grid-cols-2 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-1 gap-2 sm:gap-3">
      <li
        v-for="item in playerInfo?.inventory.items"
        :key="item.item"
        class="bg-gray-700 p-4 rounded-md flex items-center align-middle relative overflow-hidden shadow-md hover:shadow-lg transition-all"
      >
        <!-- Shape indicator based on item type -->
        <div
          :class="getItemStyle(item.item).color"
          class="w-8 h-8 mr-3 flex items-center justify-center"
          v-html="getItemStyle(item.item).svg"
        ></div>

        <div class="flex flex-col flex-grow">
          <span class="text-white font-medium text-sm">{{ item.item }}</span>
          <span class="text-gray-400 text-xs">Quantity: {{ item.quantity }}</span>
        </div>

        <!-- Quantity badge for quick view -->
        <div
          class="absolute top-1 right-1 bg-gray-800 rounded-full w-6 h-6 flex items-center justify-center"
        >
          <span class="text-white text-xs font-bold">{{ item.quantity }}</span>
        </div>
      </li>
    </ul>

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
