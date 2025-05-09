<template>
  <BaseCard class="h-full flex flex-col">
    <!-- Replace the header with the new component -->
    <SectionHeader iconColor="violet" iconName="queue" title="Seller Queue"> </SectionHeader>

    <!-- InnerCard with ScrollableContainer -->
    <InnerCard class="flex-grow flex flex-col overflow-y-auto scrollbar-hide">
      <ScrollableContainer show-scroll-indicator>
        <ul v-if="sortedSellerQueue.length" class="grid gap-1">
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

            <!-- Username section -->
            <div class="flex items-center gap-1.5">
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

            <!-- Status and action row - aligned on same line -->
            <div class="flex justify-between items-center">
              <!-- Seller Status Text -->
              <div class="text-xs h-full">
                <span
                  :class="{
                    'text-green-600 dark:text-green-400': index === 0,
                    'text-zinc-600 dark:text-zinc-400': index !== 0,
                  }"
                  class="align-bottom"
                >
                  <span v-if="index === 0" class="align-bottom">Current Seller</span>
                  <span v-else class="align-bottom"
                    >Seller in {{ index }} round{{ index > 1 ? 's' : '' }}</span
                  >
                </span>
              </div>

              <!-- Kick/Leave Button -->
              <LoadingButton
                v-if="userIsAdmin && sellerId !== userStore.user?.id"
                :confirm-message="`Are you sure you want to kick ${lobbyStore.getUser(sellerId)?.username ?? ''}?`"
                btn-style="px-2 py-0.5 text-white bg-red-500 hover:bg-red-600 rounded-md transition-colors text-xs font-medium"
                confirm-button-text="Kick"
                confirm-title="Kick Player"
                custom-style
                require-confirm
                title="Kick Player"
                @click="kick(sellerId)"
              >
                Kick
              </LoadingButton>
              <LoadingButton
                v-else-if="sellerId === userStore.user?.id"
                btn-style="px-2 py-0.5 text-white bg-red-500 hover:bg-red-600 rounded-md transition-colors text-xs font-medium"
                confirm-button-text="Leave"
                confirm-message="Are you sure you want to leave the game?"
                confirm-title="Leave Game"
                custom-style
                require-confirm
                title="Leave the game"
                @click="leave()"
              >
                Leave
              </LoadingButton>
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
import SectionHeader from '@/components/common/SectionHeader.vue'
import ScrollableContainer from '@/components/common/ScrollableContainer.vue'
import LoadingButton from '@/components/common/LoadingButton.vue'
import { useLobbyService } from '@/composables/useLobbyService.ts'
import { useLobbyInfo } from '@/composables/useLobbyInfo.ts'

const lobbyStore = useLobbyStore()
const lobbyService = useLobbyService()
const userStore = useUserStore()
const lobbyInfo = useLobbyInfo()
const { userIsAdmin } = lobbyInfo
// Sort the seller queue to always have the current seller at the top
function kick(userId: string) {
  lobbyService.kickPlayer(userId)
}

function leave() {
  lobbyService.leaveLobby()
}
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
