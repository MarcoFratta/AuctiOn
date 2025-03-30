<script lang="ts" setup>
import { useLobbyStore } from '@/stores/lobbyStore.ts'
import { computed, ref } from 'vue'
import InventoryItem from '@/components/auction/InventoryItem.vue'
import BaseCard from '@/components/BaseCard.vue'
import InnerCard from '@/components/InnerCard.vue'
import AppIcons from '@/components/ui/AppIcons.vue'

const lobbyStore = useLobbyStore()
const playerInfo = computed(() => lobbyStore.playerInfo)

// Sort functionality - removed 'name' option
const sortOptions = ['quantity', 'weight'] as const
type SortOption = (typeof sortOptions)[number]
const sortBy = ref<SortOption>('quantity')
const sortDirection = ref<'asc' | 'desc'>('desc')

const sortedInventory = computed(() => {
  if (!playerInfo.value?.inventory.items) return []

  return [...playerInfo.value.inventory.items].sort((a, b) => {
    let comparison = 0

    if (sortBy.value === 'quantity') {
      comparison = a.quantity - b.quantity
    } else if (sortBy.value === 'weight') {
      const weightA = lobbyStore.weights.find((w) => w.item === a.item)?.weight || 0
      const weightB = lobbyStore.weights.find((w) => w.item === b.item)?.weight || 0
      comparison = weightA * a.quantity - weightB * b.quantity
    }

    return sortDirection.value === 'asc' ? comparison : -comparison
  })
})

const toggleSort = (option: SortOption) => {
  if (sortBy.value === option) {
    sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortBy.value = option
    sortDirection.value = 'desc' // Default to descending (highest first)
  }
}

// Calculate total inventory weight
const totalInventoryWeight = computed(() => {
  if (!playerInfo.value?.inventory.items) return 0

  return playerInfo.value.inventory.items.reduce((total, item) => {
    const weight = lobbyStore.weights.find((w) => w.item === item.item)?.weight || 0
    return total + weight * item.quantity
  }, 0)
})

// Calculate total items count
const totalItemsCount = computed(() => {
  if (!playerInfo.value?.inventory.items) return 0

  return playerInfo.value.inventory.items.reduce((total, item) => {
    return total + item.quantity
  }, 0)
})
</script>

<template>
  <BaseCard class="h-full flex flex-col">
    <!-- Header -->
    <div class="flex items-center gap-2 mb-2 md:mb-3">
      <div class="bg-violet-100 dark:bg-app-violet-500/20 p-1.5 md:p-2 rounded-lg">
        <AppIcons color="violet" name="inventory" />
      </div>
      <h2 class="text-lg md:text-xl font-semibold text-zinc-900 dark:text-white">Your Inventory</h2>
    </div>

    <!-- Inventory Summary -->
    <div class="mb-2 md:mb-3 grid grid-cols-2 gap-2">
      <div
        class="bg-white dark:bg-neutral-800 p-2 md:p-3 rounded-lg border border-gray-100 dark:border-neutral-700/50"
      >
        <div class="flex items-center justify-between">
          <span class="text-xs md:text-sm text-gray-500 dark:text-gray-400">Total Items</span>
          <span class="text-sm md:text-base font-bold text-gray-900 dark:text-white">{{
            totalItemsCount
          }}</span>
        </div>
      </div>

      <div
        class="bg-white dark:bg-neutral-800 p-2 md:p-3 rounded-lg border border-gray-100 dark:border-neutral-700/50"
      >
        <div class="flex items-center justify-between">
          <span class="text-xs md:text-sm text-gray-500 dark:text-gray-400">Total Weight</span>
          <span class="text-sm md:text-base font-bold text-orange-600 dark:text-orange-400">{{
            totalInventoryWeight
          }}</span>
        </div>
      </div>
    </div>

    <!-- Sort Controls -->
    <div class="flex justify-between items-center mb-1 md:mb-2 px-1">
      <span class="text-xs md:text-sm text-gray-600 dark:text-gray-400">Sort by:</span>
      <div class="flex items-center gap-1 md:gap-1.5">
        <button
          v-for="option in sortOptions"
          :key="option"
          :class="[
            sortBy === option
              ? 'bg-violet-100 dark:bg-app-violet-500/20 text-violet-700 dark:text-app-violet-300'
              : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-700/30',
          ]"
          class="px-1.5 py-0.5 md:px-2 md:py-1 rounded-md transition-colors capitalize text-xs md:text-sm"
          @click="toggleSort(option)"
        >
          {{ option }}
          <span v-if="sortBy === option" class="ml-0.5">
            {{ sortDirection === 'asc' ? '↑' : '↓' }}
          </span>
        </button>
      </div>
    </div>

    <InnerCard class="flex-grow overflow-auto scrollbar-hide p-2 md:p-3">
      <!-- Item Categories -->
      <div v-if="sortedInventory.length" class="space-y-3">
        <TransitionGroup class="space-y-1.5 md:space-y-2" name="list" tag="div">
          <InventoryItem v-for="item in sortedInventory" :key="item.item" :item="item" />
        </TransitionGroup>
      </div>

      <!-- Empty State -->
      <div v-else class="flex flex-col items-center justify-center h-full py-4">
        <div class="bg-zinc-100 dark:bg-zinc-700/50 p-3 rounded-full mb-2">
          <AppIcons color="gray" name="empty" size="lg" />
        </div>
        <p class="text-zinc-600 dark:text-zinc-400 text-xs md:text-sm text-center">
          Your inventory is empty
        </p>
      </div>
    </InnerCard>
  </BaseCard>
</template>

<style scoped>
/* List transitions */
.list-enter-active,
.list-leave-active {
  transition: all 0.3s ease;
}

.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateX(20px);
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
