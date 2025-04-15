<script lang="ts" setup>
import { useLobbyStore } from '@/stores/lobbyStore.ts'
import { computed, ref } from 'vue'
import InventoryItem from '@/components/auction/InventoryItem.vue'
import BaseCard from '@/components/common/BaseCard.vue'
import InnerCard from '@/components/common/InnerCard.vue'
import AppIcons from '@/components/icons/AppIcons.vue'
import ScrollableContainer from '@/components/common/ScrollableContainer.vue'

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
    <!-- More compact header with integrated summary -->
    <div class="flex items-center justify-between gap-2 mb-1">
      <div class="flex items-center gap-1.5">
        <div class="bg-app-fuchsia-100 dark:bg-app-fuchsia-500/20 p-1 rounded-lg">
          <AppIcons color="fuchsia" name="inventory" size="sm" />
        </div>
        <h2 class="text-sm md:text-base font-semibold text-zinc-900 dark:text-white">
          Your Inventory
        </h2>
      </div>

      <!-- Inventory Summary - Always visible, more compact -->
      <div class="flex items-center gap-2 text-xs">
        <div class="flex items-center">
          <span class="text-gray-500 dark:text-gray-400 mr-1">Items:</span>
          <span class="font-bold text-gray-900 dark:text-white">{{ totalItemsCount }}</span>
        </div>
        <div class="flex items-center">
          <span class="text-gray-500 dark:text-gray-400 mr-1">Weight:</span>
          <span class="font-bold text-orange-600 dark:text-orange-400">{{
            totalInventoryWeight
          }}</span>
        </div>
      </div>
    </div>

    <!-- Sort Controls - Integrated with header -->
    <div class="flex justify-start items-center mb-1 px-1">
      <span class="text-xs text-gray-600 dark:text-gray-400 mr-1">Sort:</span>
      <div class="flex items-center gap-1">
        <button
          v-for="option in sortOptions"
          :key="option"
          :class="[
            'px-1 py-0.5 rounded-md transition-colors capitalize text-xs',
            sortBy === option
              ? 'bg-violet-100 dark:bg-app-violet-500/20 text-violet-700 dark:text-app-violet-300'
              : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-700/30',
          ]"
          @click="toggleSort(option)"
        >
          {{ option }}
          <span v-if="sortBy === option">{{ sortDirection === 'asc' ? '↑' : '↓' }}</span>
        </button>
      </div>
    </div>

    <!-- Inventory Items - Single column on small screens, scrollable -->
    <InnerCard class="flex-grow overflow-y-auto scrollbar-hide">
      <ScrollableContainer show-scroll-indicator>
        <!-- Item Categories -->
        <div v-if="sortedInventory.length" class="flex w-full flex-col">
          <TransitionGroup class="flex flex-col gap-1" name="list" tag="div">
            <InventoryItem
              v-for="item in sortedInventory"
              :key="item.item"
              :item="item"
              class="w-full"
            />
          </TransitionGroup>
        </div>

        <!-- Empty State - More compact -->
        <div v-else class="flex flex-col items-center justify-center h-full py-2">
          <div class="bg-zinc-100 dark:bg-zinc-700/50 p-2 rounded-full mb-1">
            <AppIcons color="gray" name="empty" size="md" />
          </div>
          <p class="text-zinc-600 dark:text-zinc-400 text-xs text-center">
            Your inventory is empty
          </p>
        </div>
      </ScrollableContainer>
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
