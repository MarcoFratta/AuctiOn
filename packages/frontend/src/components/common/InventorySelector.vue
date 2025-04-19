<script lang="ts" setup>
import { computed } from 'vue'
import { lobbyConfigSchema } from '@/schemas/LobbySchema.ts'
import GameShapes from '@/components/icons/GameShapes.vue'
import AppIcons from '@/components/icons/AppIcons.vue'
import { useLobbyStore } from '@/stores/lobbyStore.ts'
import z from 'zod'
import ValueBadge from '@/components/common/ValueBadge.vue'
import QuantitySelector from '@/components/common/QuantitySelector.vue'
import ScrollableContainer from '@/components/common/ScrollableContainer.vue'

type EntryType = z.infer<typeof lobbyConfigSchema.shape.startInventory.shape.items>
type ItemDetail = { min: number; max: number }

const props = defineProps<{
  items: EntryType
  error?: string
  details?: Map<string, ItemDetail>
  compact?: boolean
}>()

defineSlots(['header'])

const emits = defineEmits<{
  (event: 'update:items', value: EntryType): void
}>()

const lobbyStore = useLobbyStore()

// Calculate summary statistics
const totalSelected = computed(() => {
  if (!props.items) return 0
  return props.items.reduce((acc, item) => acc + item.quantity, 0)
})

const totalWeight = computed(() => {
  if (!props.items) return 0
  return props.items.reduce((acc, item) => {
    const weight = getItemWeight(item.item)
    return acc + weight * item.quantity
  }, 0)
})

// Helper functions
const getItemWeight = (itemName: string) => {
  return lobbyStore.weights.find((w) => w.item === itemName)?.weight || 0
}

const getItemTotalWeight = (itemName: string, quantity: number) => {
  return getItemWeight(itemName) * quantity
}

const getItemDetails = (itemName: string): ItemDetail => {
  return props.details?.get(itemName) || { min: 0, max: 0 }
}

// Update quantity for an item
const updateQuantity = (itemName: string, newQuantity: number) => {
  const index = props.items.findIndex((item) => item.item === itemName)
  if (index !== -1) {
    const updatedItems: EntryType = [...props.items]
    updatedItems[index] = { ...updatedItems[index], quantity: newQuantity }
    emits('update:items', updatedItems)
  }
}
</script>

<template>
  <div class="w-full h-full flex flex-col">
    <!-- Header slot -->
    <slot name="header"></slot>

    <!-- Main content with fixed header and footer -->
    <div class="flex-grow flex flex-col overflow-y-auto scrollbar-hide">
      <!-- Scrollable items area - ONLY items should scroll -->
      <ScrollableContainer
        container-class="rounded-md flex flex-col justify-start center-items gap-1"
        show-scroll-indicator
      >
        <div
          v-for="item in items"
          :key="item.item"
          class="inventory-item flex items-center w-full justify-between bg-white dark:bg-neutral-800 p-1.5 md:p-2 rounded-lg border border-gray-100 dark:border-neutral-800 transition-all hover:shadow-sm"
        >
          <!-- Left side: Item info -->
          <div class="flex items-center gap-2">
            <div class="w-5 h-5 flex-shrink-0 flex items-center justify-center">
              <GameShapes :type="item.item" size="sm" />
            </div>
            <div class="flex flex-col">
              <span class="text-gray-700 dark:text-gray-200 font-medium capitalize text-xs">
                {{ item.item }}
              </span>
              <div class="flex items-center text-xs text-gray-500 dark:text-gray-400">
                <AppIcons class="mr-0.5" color="orange" name="weight" size="xs" />
                <ValueBadge :color-theme="'orange'" :value="getItemWeight(item.item)" />
              </div>
            </div>
          </div>

          <!-- Right side: Controls -->
          <div class="flex items-center gap-2">
            <!-- Total weight when selected -->
            <div v-if="item.quantity > 0" class="hidden sm:flex items-center">
              <div
                class="bg-orange-50 dark:bg-orange-500/10 px-1.5 py-0.5 rounded text-xs font-medium text-orange-600 dark:text-orange-400 min-w-[1.75rem] text-center"
              >
                {{ getItemTotalWeight(item.item, item.quantity) }}
              </div>
            </div>

            <!-- Quantity selector component -->
            <QuantitySelector
              :max="getItemDetails(item.item).max"
              :min="getItemDetails(item.item).min"
              :value="item.quantity"
              @update:value="updateQuantity(item.item, $event)"
            />
          </div>
        </div>
      </ScrollableContainer>

      <!-- Summary footer - FIXED: moved outside ScrollableContainer -->
      <div
        class="mt-2 flex justify-between items-center bg-gray-50 dark:bg-neutral-800 p-2 rounded-lg"
      >
        <!-- Error message (shown when there's an error) -->
        <div v-if="error" class="w-full flex items-center justify-center">
          <div class="text-red-500 dark:text-red-400 text-xs flex items-center gap-1">
            <svg
              class="h-3.5 w-3.5"
              fill="currentColor"
              viewBox="0 0 20 20"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                clip-rule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                fill-rule="evenodd"
              />
            </svg>
            {{ error }}
          </div>
        </div>

        <!-- Summary info (shown when there's no error) -->
        <template v-else>
          <div class="flex items-center gap-2">
            <div class="flex items-center">
              <AppIcons class="mr-1" color="violet" name="inventory" size="xs" />
              <span class="text-gray-600 dark:text-gray-300 text-xs">
                Items:
                <span class="text-app-violet-500 dark:text-app-violet-400 font-medium">{{
                  totalSelected
                }}</span>
              </span>
            </div>
          </div>

          <div class="flex items-center">
            <AppIcons class="mr-1" color="orange" name="weight" size="xs" />
            <span class="text-gray-600 dark:text-gray-300 text-xs">
              Weight:
              <span class="text-orange-600 dark:text-orange-400 font-medium">{{
                totalWeight
              }}</span>
            </span>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Hide number input arrows */
input[type='number']::-webkit-inner-spin-button,
input[type='number']::-webkit-outer-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

input[type='number'] {
  -moz-appearance: textfield;
}

/* Mobile touch optimizations */
.inventory-item {
  touch-action: pan-y;
  -webkit-overflow-scrolling: touch;
}

/* Prevent text selection during scrolling */
.inventory-item * {
  user-select: none;
}

/* Only allow text selection in input fields */
input {
  user-select: auto;
  touch-action: manipulation;
}
</style>
