<script lang="ts" setup>
import { computed } from 'vue'
import type { ItemQuantity } from '@/schemas/LobbySchema.ts'

// Define slots for better type safety and documentation
const props = defineProps<{
  items: ItemQuantity[]
  error?: string
  min?: number
  max?: number
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
  <div class="p-6 bg-gray-100 rounded-lg shadow-md w-80 mx-auto">
    <!-- Header slot -->
    <slot name="header">
      <h2 class="text-lg font-semibold text-gray-800 mb-4">Select Item Quantities</h2>
    </slot>

    <div v-for="item in items" :key="item.item" class="flex justify-between items-center mb-3">
      <span class="text-gray-700">{{ item.item }}</span>
      <input
        v-model="item.quantity"
        :max="max"
        :min="min"
        class="w-16 p-1 border text-center rounded"
        type="number"
      />
    </div>

    <p v-if="!error" class="text-gray-700 mt-4">
      Total Selected: <strong>{{ totalSelected }}</strong>
    </p>
    <p v-if="error" class="text-red-700">{{ props.error }}</p>
  </div>
</template>
