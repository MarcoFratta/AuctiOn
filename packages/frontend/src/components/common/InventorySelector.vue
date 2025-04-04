<script lang="ts" setup>
import { computed } from 'vue'
import { lobbyConfigSchema } from '@/schemas/LobbySchema.ts'
import GameShapes from '@/components/icons/GameShapes.vue'
import z from 'zod'

type EntryType = z.infer<typeof lobbyConfigSchema.shape.startInventory.shape.items>
// Define slots for better type safety and documentation
const props = defineProps<{
  items: EntryType
  error?: string
  details?: Map<
    string,
    {
      min: number
      max: number
    }
  >
}>()

defineSlots<{
  header?: () => any
}>()

const emits = defineEmits<{
  (event: 'update:items', value: EntryType): void
}>()

const totalSelected = computed(() => {
  if (!props.items) return 0
  return props.items.reduce((acc, item) => acc + item.quantity, 0)
})

// Update quantity for an item
const updateQuantity = (item: string, value: number) => {
  const detail = props.details?.get(item)
  if (!detail) return

  // Clamp value between min and max
  const clampedValue = Math.max(detail.min, Math.min(detail.max, value))

  const index = props.items.findIndex((q) => q.item === item)
  if (index !== -1) {
    const updatedItems: EntryType = [...props.items]
    updatedItems[index] = { ...updatedItems[index], quantity: clampedValue }
    if (updatedItems.find((i) => i.quantity > 0)) {
      emits('update:items', updatedItems)
    }
  }
}
</script>

<template>
  <div class="w-full">
    <!-- Header slot -->
    <slot name="header"></slot>

    <div class="space-y-3">
      <div
        v-for="item in items"
        :key="item.item"
        class="flex items-center justify-between bg-app-white dark:bg-neutral-700 p-3 rounded-lg border border-gray-100 dark:border-neutral-800 transition-all hover:shadow-sm"
      >
        <div class="flex items-center gap-3">
          <div class="w-5 h-5 md:w-6 md:h-6 flex-shrink-0 flex items-center justify-center">
            <GameShapes :type="item.item" size="sm" />
          </div>
          <span
            class="text-gray-700 dark:text-gray-200 font-medium capitalize text-xs md:text-sm"
            >{{ item.item }}</span
          >
        </div>

        <div class="flex items-center">
          <div class="relative flex items-center">
            <button
              :disabled="item.quantity <= (details?.get(item.item)?.min || 0)"
              class="w-6 h-6 md:w-7 md:h-7 flex items-center justify-center rounded-l-md bg-gray-100 dark:bg-neutral-800 text-gray-500 dark:text-gray-300 hover:bg-neutral-200 dark:hover:bg-neutral-600 transition-colors"
              type="button"
              @click="updateQuantity(item.item, item.quantity - 1)"
            >
              <svg
                class="h-3 w-3 md:h-4 md:w-4"
                fill="currentColor"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  clip-rule="evenodd"
                  d="M3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                  fill-rule="evenodd"
                />
              </svg>
            </button>

            <label :for="item.item" class="sr-only">Quantity for {{ item.item }}</label>
            <input
              :id="item.item"
              v-model="item.quantity"
              :max="details?.get(item.item)?.max"
              :min="details?.get(item.item)?.min"
              class="w-10 md:w-12 h-6 md:h-7 bg-white dark:bg-neutral-800 border-y border-neutral-200 dark:border-neutral-800 text-center text-gray-700 dark:text-gray-200 text-xs md:text-sm focus:outline-none focus:ring-1 focus:ring-transparent"
              type="number"
              @change="updateQuantity(item.item, item.quantity)"
            />

            <button
              :disabled="item.quantity >= (details?.get(item.item)?.max || Infinity)"
              class="w-6 h-6 md:w-7 md:h-7 flex items-center justify-center rounded-r-md bg-gray-100 dark:bg-neutral-800 text-gray-500 dark:text-gray-300 hover:bg-neutral-200 dark:hover:bg-neutral-600 transition-colors"
              type="button"
              @click="updateQuantity(item.item, item.quantity + 1)"
            >
              <svg
                class="h-3 w-3 md:h-4 md:w-4"
                fill="currentColor"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  clip-rule="evenodd"
                  d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                  fill-rule="evenodd"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>

    <div class="mt-4 flex justify-between items-center">
      <div class="flex items-center gap-2">
        <div
          class="w-5 h-5 md:w-6 md:h-6 flex items-center justify-center rounded-full bg-violet-100 dark:bg-violet-900/30"
        >
          <svg
            class="h-3 w-3 md:h-3.5 md:w-3.5 text-app-violet-500"
            fill="currentColor"
            viewBox="0 0 20 20"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              clip-rule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z"
              fill-rule="evenodd"
            />
          </svg>
        </div>
        <p v-if="!error" class="text-gray-600 dark:text-gray-300 text-xs md:text-sm">
          Total items: <span class="text-app-violet-500 font-medium">{{ totalSelected }}</span>
        </p>
        <p
          v-if="error"
          class="text-red-500 dark:text-red-400 text-xs md:text-sm flex items-center gap-1"
        >
          <svg
            class="h-3.5 w-3.5 md:h-4 md:w-4"
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
          {{ props.error }}
        </p>
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
</style>
