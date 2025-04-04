<template>
  <InnerCard class="overflow-hidden">
    <div class="flex items-center">
      <!-- Position Badge or Removed Icon -->
      <div
        v-if="!isRemoved"
        :class="[
          positionClass,
          'w-8 h-8 flex items-center justify-center rounded-full text-sm font-bold shadow-sm flex-shrink-0',
        ]"
      >
        {{ position }}
      </div>
      <div
        v-else
        class="w-8 h-8 flex-shrink-0 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center"
      >
        <span class="text-red-500 dark:text-red-400">❌</span>
      </div>

      <!-- Medal Icons (only for non-removed players) -->
      <div v-if="!isRemoved" class="ml-2 w-6 flex-shrink-0">
        <span v-if="position === 1" class="text-yellow-500 animate-pulse-slow">👑</span>
        <span v-else-if="position === 2" class="text-gray-400 dark:text-gray-300">🥈</span>
        <span v-else-if="position === 3" class="text-amber-600 dark:text-amber-500">🥉</span>
      </div>

      <!-- Player Info -->
      <div class="ml-2 flex-grow min-w-0">
        <div class="flex items-center justify-between">
          <!-- Player Name -->
          <div class="flex gap-2 items-center justify-start">
            <span
              :class="[
                isCurrentPlayer
                  ? isRemoved
                    ? 'text-red-950 dark:text-red-300 font-semibold'
                    : 'text-violet-900 dark:text-app-violet-200 font-semibold'
                  : 'text-gray-800 dark:text-white',
              ]"
              class="font-medium text-sm truncate"
            >
              {{ getUsername(entry.id) }}
            </span>
            <!-- "You" Tag -->
            <span
              v-if="isCurrentPlayer"
              :class="[
                isRemoved
                  ? 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-300'
                  : 'bg-violet-100 dark:bg-app-violet-500/20 text-violet-700 dark:text-app-violet-300',
              ]"
              class="px-1.5 py-0.5 text-xs rounded-full"
            >
              You
            </span>
          </div>

          <!-- Money -->
          <span :class="[moneyColorClass, 'text-sm font-bold ml-2 flex-shrink-0']">
            {{ formatMoney(entry.money) }}
          </span>
        </div>

        <!-- Item Count & Expand Button -->
        <div class="flex items-center mt-1 justify-between">
          <div
            :class="[
              isRemoved
                ? 'bg-red-50 dark:bg-red-900/10 text-red-700 dark:text-red-300'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300',
            ]"
            class="text-xs px-2 py-0.5 rounded-full"
          >
            {{ totalItems }} items
          </div>

          <button
            :class="[
              isRemoved
                ? 'hover:text-red-600 dark:hover:text-red-400'
                : 'hover:text-violet-600 dark:hover:text-violet-400',
            ]"
            class="text-gray-500 transition-colors flex items-center text-xs"
            @click="isExpanded = !isExpanded"
          >
            <span class="mr-1">{{ isExpanded ? 'Hide' : 'Show' }} inventory</span>
            <svg
              :class="{ 'rotate-90': isExpanded }"
              class="w-4 h-4 transition-transform duration-200"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                d="M9 5l7 7-7 7"
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>

    <!-- Expandable Inventory Section -->
    <div
      v-if="isExpanded"
      :class="[
        isRemoved
          ? 'bg-red-50/75 dark:bg-red-900/10 border-red-500/50'
          : 'bg-neutral-100/75 dark:bg-neutral-800/30 border-violet-500/50',
      ]"
      class="mt-2 border-t p-3 transition-all duration-300 rounded-md"
    >
      <InventoryDisplay
        :inventory="entry.inventory"
        :layout="640"
        compact
        sortBy="quantity"
        sortDirection="desc"
      />
    </div>
  </InnerCard>
</template>

<script lang="ts" setup>
import { computed, ref } from 'vue'
import InventoryDisplay from '@/components/inventory/InventoryDisplay.vue'
import { type LeaderboardEntry } from '@/schemas/LeaderboardSchema.ts'
import { useResultsStore } from '@/stores/resultsStore.ts'
import InnerCard from '@/components/common/InnerCard.vue'

const props = defineProps<{
  entry: LeaderboardEntry | Omit<LeaderboardEntry, 'position'>
  isCurrentPlayer: boolean
  isRemoved?: boolean
}>()

const resultsStore = useResultsStore()
const isExpanded = ref(false)
const position = !props.isRemoved ? (props.entry as LeaderboardEntry).position : undefined
function getUsername(id: string): string {
  const user = resultsStore.users.find((u) => u.id === id)
  return user?.username ?? 'Unknown Player'
}

function formatMoney(amount: number): string {
  return `$${amount.toLocaleString()}`
}

const positionClass = computed(() => {
  if (!props.isRemoved && 'position' in props.entry) {
    if (position === 1) return 'bg-gradient-to-br from-yellow-300 to-yellow-500 text-gray-900'
    if (position === 2) return 'bg-gradient-to-br from-gray-200 to-gray-400 text-gray-900'
    if (position === 3) return 'bg-gradient-to-br from-amber-500 to-amber-700 text-white'
  }
  return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white'
})

const moneyColorClass = computed(() => {
  if (props.isRemoved) {
    return props.entry.money > 0
      ? 'text-amber-600 dark:text-amber-400'
      : 'text-red-600 dark:text-red-400'
  }

  if (props.entry.money > 500) return 'text-green-600 dark:text-green-400'
  if (props.entry.money > 200) return 'text-emerald-600 dark:text-emerald-400'
  if (props.entry.money > 100) return 'text-teal-600 dark:text-teal-400'
  return 'text-amber-600 dark:text-amber-400'
})

// Calculate total items
const totalItems = computed(() => {
  if (!props.entry.inventory?.items) return 0
  return props.entry.inventory.items.reduce((sum, item) => sum + item.quantity, 0)
})
</script>

<style scoped>
@keyframes pulse-slow {
  0%,
  100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.8;
    transform: scale(1.1) rotate(5deg);
  }
}

.animate-pulse-slow {
  animation: pulse-slow 3s ease-in-out infinite;
}
</style>
