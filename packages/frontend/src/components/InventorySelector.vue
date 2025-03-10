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
  <div class="bg-gray-800 rounded-lg w-full mb-4">
    <!-- Header slot -->
    <slot name="header"> </slot>

    <div class="grid gap-1">
      <div
        v-for="item in items"
        :key="item.item"
        class="flex justify-between items-center bg-gray-700 p-1 rounded-md"
      >
        <span class="text-gray-400">{{ item.item }}</span>
        <input
          v-model="item.quantity"
          :max="details?.get(item.item)?.max"
          :min="details?.get(item.item)?.min"
          class="w-16 p-1 bg-gray-600 border border-gray-500 text-white text-center rounded"
          type="number"
        />
      </div>
    </div>

    <div class="mt-4 flex justify-between items-center">
      <p v-if="!error" class="text-gray-400">
        Total Selected: <span class="text-green-400 font-medium">{{ totalSelected }}</span>
      </p>
      <p v-if="error" class="text-red-400">{{ props.error }}</p>
    </div>
  </div>
</template>
