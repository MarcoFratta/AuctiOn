<script lang="ts" setup>
import { getShape } from '@/icons/shapes.ts'
import { computed } from 'vue'
import { useLobbyStore } from '@/stores/lobbyStore.ts'

const props = defineProps<{
  item: {
    item: string
    quantity?: number
  }
}>()
const lobbyStore = useLobbyStore()
const weight = computed(() => {
  return (
    (props.item.quantity ?? 1) *
    (lobbyStore.weights.find((i) => i.item === props.item.item)?.weight ?? 0)
  )
})
const svg = getShape(props.item.item)
const color = (() => {
  switch (props.item.item) {
    case 'circle':
      return 'fill-blue-500'
    case 'square':
      return 'fill-red-500'
    case 'triangle':
      return 'fill-green-500'
    default:
      return 'fill-blue-500'
  }
})()
</script>

<template>
  <div class="bg-gray-800 rounded-md p-2 flex justify-between items-center w-full">
    <!-- Left side with icon and item details -->
    <div class="flex items-center gap-3 flex-grow">
      <!-- Shape Icon -->
      <div :class="[color, 'min-w-6 h-6 flex-shrink-0']" v-html="svg"></div>

      <!-- Item details - with or without quantity -->
      <div v-if="item.quantity" class="flex flex-col">
        <span class="text-white font-medium text-sm md:text-base truncate">{{ item.item }}</span>
        <span class="text-gray-400 text-xs md:text-sm">Quantity: {{ item.quantity }}</span>
      </div>
      <div v-else class="flex items-center">
        <p class="text-white font-medium text-sm md:text-base truncate">{{ item.item }}</p>
      </div>
    </div>

    <!-- Right side with weight -->
    <span class="text-orange-400 font-bold text-sm md:text-base ml-2">{{ weight }}</span>
  </div>
</template>

<style scoped></style>
