<script lang="ts" setup>
import { useLobbyStore } from '@/stores/lobbyStore.ts'
import { computed, ref } from 'vue'
import InventoryItem from '@/components/auction/InventoryItem.vue'

const lobbyStore = useLobbyStore()
const playerInfo = computed(() => lobbyStore.playerInfo)

// Sort functionality
const sortOptions = ['name', 'quantity', 'weight'] as const
type SortOption = (typeof sortOptions)[number]
const sortBy = ref<SortOption>('name')
const sortDirection = ref<'asc' | 'desc'>('asc')

const sortedInventory = computed(() => {
  if (!playerInfo.value?.inventory.items) return []

  return [...playerInfo.value.inventory.items].sort((a, b) => {
    let comparison = 0

    if (sortBy.value === 'name') {
      comparison = a.item.localeCompare(b.item)
    } else if (sortBy.value === 'quantity') {
      comparison = (a.quantity || 0) - (b.quantity || 0)
    } else if (sortBy.value === 'weight') {
      const aWeight = lobbyStore.weights.find((w) => w.item === a.item)?.weight || 0
      const bWeight = lobbyStore.weights.find((w) => w.item === b.item)?.weight || 0
      comparison = aWeight - bWeight
    }

    return sortDirection.value === 'asc' ? comparison : -comparison
  })
})

const toggleSort = (option: SortOption) => {
  if (sortBy.value === option) {
    sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortBy.value = option
    sortDirection.value = 'asc'
  }
}
</script>

<template>
  <!-- Player Inventory & Money -->
  <div class="bg-gray-800 w-full p-3 lg:p-6 rounded-lg shadow-lg flex flex-col">
    <!-- Header layout with money -->
    <div class="flex justify-between items-center mb-3 lg:mb-4">
      <h2 class="text-lg lg:text-2xl font-bold text-white flex items-center">
        <span class="mr-2">🎒</span> Your Inventory
      </h2>

      <!-- Money display -->
      <div class="bg-gray-700 px-3 py-1.5 lg:px-4 lg:py-2 rounded-md shrink-0 flex items-center">
        <span class="text-gray-400 text-sm lg:text-base flex items-center">
          <span class="text-yellow-400 mr-1.5">💰</span>
          <span class="text-green-400 font-bold">${{ playerInfo?.money || 0 }}</span>
        </span>
      </div>
    </div>

    <!-- Sort controls -->
    <div
      class="bg-gray-700 p-2 rounded-t-lg border-b border-gray-600 flex justify-between items-center text-xs lg:text-sm"
    >
      <div class="flex gap-4">
        <button
          v-for="option in sortOptions"
          :key="option"
          :class="[
            'flex items-center',
            sortBy === option ? 'text-blue-400 font-medium' : 'text-gray-400',
          ]"
          @click="toggleSort(option)"
        >
          {{ option.charAt(0).toUpperCase() + option.slice(1) }}
          <span v-if="sortBy === option" class="ml-1">
            {{ sortDirection === 'asc' ? '↑' : '↓' }}
          </span>
        </button>
      </div>
      <span class="text-gray-400">{{ sortedInventory.length }} items</span>
    </div>

    <!-- Inventory items - Removed max-height and overflow -->
    <div class="bg-gray-700 p-2 lg:p-4 rounded-b-lg">
      <transition-group
        class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 lg:gap-3"
        name="list"
        tag="ul"
      >
        <li
          v-for="item in sortedInventory"
          :key="item.item"
          class="flex items-center justify-between bg-gray-800 p-2 lg:p-3 rounded-md hover:bg-gray-750 transition-colors"
        >
          <InventoryItem :item="item" class="text-base lg:text-xl" />
        </li>
      </transition-group>

      <!-- Empty inventory message -->
      <div
        v-if="!sortedInventory.length"
        class="flex flex-col items-center justify-center py-8 text-center"
      >
        <div class="text-gray-500 text-5xl mb-3">🧺</div>
        <p class="text-gray-400 text-sm lg:text-base">Your inventory is empty</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
svg {
  width: 100%;
  height: 100%;
}

/* List transitions */
.list-enter-active,
.list-leave-active {
  transition: all 0.3s ease;
}

.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateX(30px);
}
</style>
