<script lang="ts" setup>
import { computed } from 'vue'
import type { ItemQuantity } from '@/schemas/LobbySchema.ts'

// Define slots for better type safety and documentation
const props = defineProps<{
  items: ItemQuantity[]
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
  (event: 'update:items', value: ItemQuantity[]): void
}>()

const totalSelected = computed(() => {
  return props.items.reduce((acc, item) => acc + item.quantity, 0)
})
</script>

<template>
  <div class="w-full">
    <!-- Header slot -->
    <slot name="header"></slot>

    <div class="space-y-2">
      <div
        v-for="item in items"
        :key="item.item"
        class="flex items-center justify-between bg-gray-800 p-2 rounded-lg"
      >
        <div class="flex items-center gap-2">
          <span class="text-gray-200 font-medium text-sm">{{ item.item }}</span>
        </div>
        <div class="flex items-center gap-1">
          <label :for="item.item" class="sr-only">Quantity for {{ item.item }}</label>
          <input
            :id="item.item"
            v-model="item.quantity"
            :max="details?.get(item.item)?.max"
            :min="details?.get(item.item)?.min"
            class="w-16 p-1 bg-gray-700 border border-gray-600 text-white text-center rounded-md focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none text-sm quantity-input"
            type="number"
          />
        </div>
      </div>
    </div>

    <div class="mt-2 flex justify-between items-center">
      <p v-if="!error" class="text-gray-300 text-sm">
        Total: <span class="text-blue-400 font-medium">{{ totalSelected }}</span>
      </p>
      <p v-if="error" class="text-red-400 text-sm">{{ props.error }}</p>
    </div>
  </div>
</template>
