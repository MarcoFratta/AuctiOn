<script lang="ts" setup>
import GameShapes from '@/components/icons/GameShapes.vue'
import AppIcons from '@/components/icons/AppIcons.vue'
import ValueBadge from '@/components/common/ValueBadge.vue'
import { useLobbyStore } from '@/stores/lobbyStore.ts'
import { computed } from 'vue'

const props = defineProps<{
  item: string
  quantity: number
}>()

const lobbyStore = useLobbyStore()

const weight = computed(() => {
  return lobbyStore.weights.find((w) => w.item === props.item)?.weight || 0
})
</script>

<template>
  <div
    class="flex items-center justify-between p-2 bg-white dark:bg-neutral-800 rounded-lg border border-neutral-100 dark:border-neutral-700/50"
  >
    <!-- Item Info -->
    <div class="flex items-center">
      <div class="w-6 h-6 flex-shrink-0 flex items-center justify-center mr-2">
        <GameShapes :type="item" class="text-violet-500 dark:text-app-violet-400" size="sm" />
      </div>
      <span class="text-sm font-medium text-neutral-800 dark:text-neutral-200 capitalize">{{
        item
      }}</span>
    </div>

    <!-- Quantity and Weight Badges -->
    <div class="flex items-center space-x-1.5">
      <!-- Use ValueBadge for Quantity -->
      <ValueBadge :value="quantity" color-theme="violet" />
      <!-- Use ValueBadge for Weight -->
      <ValueBadge :value="weight * quantity" color-theme="orange" />
    </div>
  </div>
</template>
