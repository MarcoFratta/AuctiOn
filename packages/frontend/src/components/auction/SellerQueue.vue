<template>
  <BaseCard class="h-full flex flex-col">
    <!-- Header -->
    <div class="flex items-center gap-2 mb-2 md:mb-3">
      <div class="bg-violet-100 dark:bg-app-violet-500/20 p-1.5 md:p-2 rounded-lg">
        <AppIcons color="violet" name="queue" />
      </div>
      <h2 class="text-lg md:text-xl font-semibold text-zinc-900 dark:text-white">Seller Queue</h2>
    </div>

    <InnerCard class="flex-grow overflow-auto scrollbar-hide p-2 md:p-3">
      <ul v-if="sortedSellerQueue.length" class="grid gap-2">
        <li
          v-for="(sellerId, index) in sortedSellerQueue"
          :key="sellerId"
          :class="{
            'bg-violet-50 dark:bg-app-violet-500/10 border-violet-200 dark:border-app-violet-500/30':
              index === 0,
            'bg-white dark:bg-neutral-800 border-gray-100 dark:border-neutral-700/50': index !== 0,
          }"
          class="p-2 md:p-3 rounded-lg transition-all border relative"
        >
          <!-- Status Dot (Top Right) -->
          <span
            :class="
              lobbyStore.users.find((p) => p.id === sellerId)?.connected
                ? 'bg-green-500'
                : 'bg-red-500'
            "
            class="w-2.5 h-2.5 rounded-full absolute top-2 right-2 md:top-3 md:right-3"
          ></span>

          <div class="flex items-center gap-2 mb-1">
            <!-- Username -->
            <span
              :class="{
                'text-violet-700 dark:text-app-violet-300': sellerId === userStore?.user?.id,
                'text-zinc-900 dark:text-white': sellerId !== userStore?.user?.id,
              }"
              class="text-sm md:text-base font-medium truncate"
            >
              {{ lobbyStore.users.find((p) => p.id === sellerId)?.username ?? 'Unknown' }}
            </span>

            <!-- "You" Tag -->
            <span
              v-if="sellerId === userStore?.user?.id"
              class="px-1.5 py-0.5 bg-violet-100 dark:bg-app-violet-500/20 text-violet-700 dark:text-app-violet-300 text-xs rounded-full"
            >
              You
            </span>
          </div>

          <!-- Seller Status Text -->
          <div class="ml-1 text-xs md:text-sm">
            <span
              :class="{
                'text-green-600 dark:text-green-400': index === 0,
                'text-zinc-600 dark:text-zinc-400': index !== 0,
              }"
            >
              <span v-if="index === 0">
                <span class="font-medium">Current Seller</span>
              </span>
              <span v-else>
                <span class="font-medium"
                  >Seller in {{ index }} round{{ index > 1 ? 's' : '' }}</span
                >
              </span>
            </span>
          </div>
        </li>
      </ul>

      <div v-else class="flex flex-col items-center justify-center py-4">
        <div class="bg-zinc-100 dark:bg-zinc-700/50 p-3 rounded-full mb-2">
          <svg
            class="h-6 w-6 text-zinc-500 dark:text-zinc-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
            ></path>
          </svg>
        </div>
        <p class="text-zinc-600 dark:text-zinc-400 text-xs md:text-sm text-center">
          No sellers in queue
        </p>
      </div>
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
