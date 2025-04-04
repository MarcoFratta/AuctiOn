<script lang="ts" setup>
import { useLobbyStore } from '@/stores/lobbyStore.ts'
import { computed } from 'vue'
import BaseCard from '@/components/common/BaseCard.vue'
import InnerCard from '@/components/common/InnerCard.vue'
import GameShapes from '@/components/icons/GameShapes.vue'
import AppIcons from '@/components/icons/AppIcons.vue'

const lobbyStore = useLobbyStore()
const weights = computed(() => lobbyStore.weights)
</script>

<template>
  <BaseCard class="h-full flex flex-col">
    <!-- Header -->
    <div class="flex items-center gap-2 mb-2 md:mb-3">
      <div class="bg-yellow-100 dark:bg-yellow-500/20 p-1.5 md:p-2 rounded-lg">
        <AppIcons color="yellow" name="info" />
      </div>
      <h2 class="text-lg md:text-xl font-semibold text-zinc-900 dark:text-white">Auction Rules</h2>
    </div>

    <InnerCard class="flex-grow overflow-auto scrollbar-hide p-2 md:p-3">
      <!-- Item Weights Section -->
      <div class="mb-4">
        <h3 class="text-sm md:text-base font-semibold text-zinc-900 dark:text-white mb-2">
          Item Weights
        </h3>
        <p class="text-xs md:text-sm text-zinc-600 dark:text-zinc-400 mb-3">
          Each item has a weight that affects its value in the auction. Higher weight items are more
          valuable.
        </p>
        <div class="space-y-2">
          <div
            v-for="weight in weights"
            :key="weight.item"
            class="flex items-center justify-between bg-white dark:bg-neutral-800 p-2 md:p-3 rounded-lg border border-gray-100 dark:border-neutral-700/50"
          >
            <div class="flex items-center">
              <div
                class="w-5 h-5 md:w-6 md:h-6 mr-2 flex-shrink-0 flex items-center justify-center"
              >
                <GameShapes :type="weight.item" size="sm" />
              </div>
              <span
                class="text-gray-900 dark:text-white text-xs md:text-sm font-medium capitalize"
                >{{ weight.item }}</span
              >
            </div>
            <span class="text-orange-600 dark:text-orange-400 font-bold text-xs md:text-sm">{{
              weight.weight
            }}</span>
          </div>
        </div>
      </div>
    </InnerCard>
  </BaseCard>
</template>

<style scoped>
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
