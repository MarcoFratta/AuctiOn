<template>
  <BaseCard class="h-full flex flex-col">
    <!-- More compact header -->
    <div class="flex items-center gap-1.5 mb-1.5">
      <div class="bg-app-violet-100 dark:bg-app-violet-500/20 p-1 rounded-lg">
        <AppIcons color="violet" name="queue" size="sm" />
      </div>
      <h2 class="text-sm md:text-base font-semibold text-zinc-900 dark:text-white">Seller Queue</h2>
    </div>

    <!-- InnerCard with ScrollableContainer -->
    <InnerCard class="flex-grow flex flex-col overflow-y-auto scrollbar-hide">
      <ScrollableContainer show-scroll-indicator>
        <ul v-if="sortedSellerQueue.length" class="grid gap-1.5">
          <li
            v-for="(sellerId, index) in sortedSellerQueue"
            :key="sellerId"
            :class="{
              'bg-violet-50 dark:bg-app-violet-500/10 border-violet-200 dark:border-app-violet-500/30':
                index === 0,
              'bg-white dark:bg-neutral-800 border-gray-100 dark:border-neutral-700/50':
                index !== 0,
            }"
            class="p-2 rounded-lg transition-all border relative"
          >
            <!-- Status Dot (Top Right) -->
            <span
              :class="
                lobbyStore.users.find((p) => p.id === sellerId)?.connected
                  ? 'bg-green-500'
                  : 'bg-red-500'
              "
              class="w-2 h-2 rounded-full absolute top-1.5 right-1.5"
            ></span>

            <div class="flex items-center gap-1.5">
              <!-- Username -->
              <span
                :class="{
                  'text-violet-700 dark:text-app-violet-300': sellerId === userStore?.user?.id,
                  'text-zinc-900 dark:text-white': sellerId !== userStore?.user?.id,
                }"
                class="text-xs md:text-sm font-medium truncate"
              >
                {{ lobbyStore.users.find((p) => p.id === sellerId)?.username ?? 'Unknown' }}
              </span>

              <!-- "You" Tag -->
              <span
                v-if="sellerId === userStore?.user?.id"
                class="px-1 py-0.5 bg-violet-100 dark:bg-app-violet-500/20 text-violet-700 dark:text-app-violet-300 text-xs rounded-full"
              >
                You
              </span>
            </div>

            <!-- Seller Status Text - Under username but more compact -->
            <div class="ml-0.5 text-xs">
              <span
                :class="{
                  'text-green-600 dark:text-green-400': index === 0,
                  'text-zinc-600 dark:text-zinc-400': index !== 0,
                }"
              >
                <span v-if="index === 0">Current Seller</span>
                <span v-else>Seller in {{ index }} round{{ index > 1 ? 's' : '' }}</span>
              </span>
            </div>
          </li>
        </ul>

        <!-- Empty state with the new icon -->
        <div v-else class="flex flex-col items-center justify-center py-6">
          <div class="bg-neutral-100 dark:bg-neutral-700/50 p-3 rounded-full mb-2">
            <AppIcons color="gray" name="no-players" size="md" />
          </div>
          <p class="text-neutral-600 dark:text-neutral-400 text-xs text-center">
            No sellers in queue
          </p>
        </div>
      </ScrollableContainer>
    </InnerCard>
  </BaseCard>
</template>

<script lang="ts" setup>
import { useLobbyStore } from '@/stores/lobbyStore'
import { useUserStore } from '@/stores/userStore'
import { computed } from 'vue'
import BaseCard from '@/components/common/BaseCard.vue'
import InnerCard from '@/components/common/InnerCard.vue'
import AppIcons from '@/components/icons/AppIcons.vue'
import ScrollableContainer from '@/components/common/ScrollableContainer.vue'

const lobbyStore = useLobbyStore()
const userStore = useUserStore()

// Sort the seller queue to always have the current seller at the top
const sortedSellerQueue = computed(() => {
  if (!lobbyStore.lobby?.sellerQueue || !lobbyStore.lobby.sellerQueue.length) {
    return []
  }

  const queue = [...lobbyStore.lobby.sellerQueue]
  const currentIndex = lobbyStore.sellerIndex

  // Reorder the array to have the current seller first
  return [...queue.slice(currentIndex), ...queue.slice(0, currentIndex)]
})
</script>

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
