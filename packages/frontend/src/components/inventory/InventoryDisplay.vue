<template>
  <div :class="{ 'space-y-2': !compact, 'space-y-1': compact }">
    <div
      v-if="inventory && inventory.items.length > 0"
      :class="[layout === 'vertical' ? 'flex flex-col space-y-2' : 'flex flex-wrap gap-1.5']"
    >
      <div
        v-for="item in sortedItems"
        :key="item.item"
        :class="[
          getItemColorClass(item.item),
          compact ? 'py-0.5 px-1.5' : 'py-1 px-2',
          layout === 'vertical'
            ? 'flex items-center justify-between p-2 rounded-md bg-white dark:bg-neutral-700/50 border border-neutral-100 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-700/80 transition-colors'
            : 'flex items-center gap-1.5 rounded-md border transition-all duration-200 hover:shadow-sm hover:bg-neutral-50 dark:hover:bg-neutral-700/80 bg-white dark:bg-neutral-800 border-neutral-100 dark:border-neutral-700/50',
        ]"
      >
        <!-- Item Icon -->
        <div class="w-6 h-6 flex-shrink-0 mr-2">
          <GameShapes :type="getShapeType(item.item)" size="xs" />
        </div>

        <!-- Item Name -->
        <span
          :class="[
            compact ? 'text-xs' : 'text-sm',
            'font-medium text-neutral-700 dark:text-neutral-300 truncate',
            layout === 'vertical' ? 'max-w-[120px] sm:max-w-[180px]' : 'max-w-[60px] sm:max-w-none',
          ]"
        >
          {{ formatItemName(item.item) }}
        </span>

        <!-- Item Quantity -->
        <span
          :class="[
            getItemTextColorClass(item.item),
            compact ? 'text-xs' : 'text-sm',
            'font-semibold ml-auto',
          ]"
        >
          {{ item.quantity }}
        </span>
      </div>
    </div>

    <!-- Empty State -->
    <div
      v-else
      class="flex items-center justify-center py-1.5 px-3 bg-neutral-50 dark:bg-neutral-800/50 rounded-md"
    >
      <span class="text-xs text-neutral-500 dark:text-neutral-400 italic">No items</span>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, onMounted, onUnmounted, ref } from 'vue'
import GameShapes from '@/components/icons/GameShapes.vue'
import type { ItemQuantity } from '@/schemas/LobbySchema.ts'
import { type ShapeType } from '@/icons/shapes.ts'

// Define a local interface for Inventory
interface Inventory {
  items: ItemQuantity[]
}

const props = defineProps<{
  inventory: Inventory
  compact?: boolean
  layout: 'horizontal' | 'vertical' | number
  sortBy?: 'quantity' | 'name'
  sortDirection?: 'asc' | 'desc'
}>()

// Default prop values
const auto = ref(typeof props.layout == 'number' ? props.layout : null)
const layout = ref(
  auto.value ? (window.innerWidth > auto.value ? 'horizontal' : 'vertical') : 'horizontal',
)
const sortBy = props.sortBy || 'quantity'
const sortDirection = props.sortDirection || 'desc'

const handleResize = () => {
  if (window.innerWidth > auto.value!) {
    layout.value = 'horizontal'
  } else {
    layout.value = 'vertical'
  }
}

onMounted(() => {
  if (auto.value) {
    window.addEventListener('resize', handleResize)
  }
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})

function formatItemName(name: string): string {
  // Convert camelCase or snake_case to Title Case with spaces
  return name
    .replace(/([A-Z])/g, ' $1')
    .replace(/_/g, ' ')
    .replace(/^\w/, (c) => c.toUpperCase())
    .trim()
}

function getShapeType(itemName: string): ShapeType {
  // Map item names to shape types
  const mapping: Record<string, ShapeType> = {
    square: 'square',
    circle: 'circle',
    triangle: 'triangle',
  }
  return mapping[itemName] || 'square'
}

function getItemColorClass(itemName: string): string {
  // Map item names to tailwind border color classes
  const mapping: Record<string, string> = {
    square: 'border-red-200 dark:border-red-800/30',
    circle: 'border-blue-200 dark:border-blue-800/30',
    triangle: 'border-green-200 dark:border-green-800/30',
  }

  return mapping[itemName] || 'border-violet-200 dark:border-violet-800/30'
}

function getItemTextColorClass(itemName: string): string {
  // Map item names to tailwind text color classes
  const mapping: Record<string, string> = {
    square: 'text-red-600 dark:text-red-400',
    circle: 'text-blue-600 dark:text-blue-400',
    triangle: 'text-green-600 dark:text-green-400',
  }

  return mapping[itemName] || 'text-violet-600 dark:text-violet-400'
}

// Sort inventory items
const sortedItems = computed(() => {
  if (!props.inventory.items) return []

  return [...props.inventory.items].sort((a, b) => {
    if (sortBy === 'name') {
      return sortDirection === 'asc' ? a.item.localeCompare(b.item) : b.item.localeCompare(a.item)
    } else {
      return sortDirection === 'asc' ? a.quantity - b.quantity : b.quantity - a.quantity
    }
  })
})
</script>
