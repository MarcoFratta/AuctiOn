<template>
  <Background>
    <!-- Teleport the game status indicators to the header right content slot -->
    <Teleport to="#header-right-content">
      <GameHeader />
    </Teleport>
    <LobbyLoading v-if="!lobbyStore.lobby" />
    <!-- Main Content Area -->
    <div v-else class="w-full max-w-7xl mx-auto mb-2 sm:mb-0 sm:mt-2 lg:mt-4 sm:px-4">
      <!-- Game Shapes for decoration -->
      <div class="absolute top-20 -left-10 opacity-30 hidden xl:block">
        <GameShapes
          :color="settingsStore.darkMode ? 'violet' : 'default'"
          animated
          size="lg"
          type="circle"
        />
      </div>
      <div class="absolute top-40 -right-8 opacity-30 hidden xl:block">
        <GameShapes
          :color="settingsStore.darkMode ? 'fuchsia' : 'default'"
          animated
          size="lg"
          type="triangle"
        />
      </div>
      <div class="absolute bottom-20 -left-5 opacity-30 hidden xl:block">
        <GameShapes
          :color="settingsStore.darkMode ? 'fuchsia' : 'default'"
          animated
          size="md"
          type="square"
        />
      </div>

      <!-- Game Content -->
      <div
        class="flex-1 w-full flex flex-col lg:grid lg:grid-cols-12 sm:gap-2 md:gap-4 mb-4 pb-8 sm:pb-3 relative z-10"
      >
        <!-- Left and Center Content (9 columns on desktop) -->
        <div class="lg:col-span-9 flex flex-col sm:gap-2 md:gap-4">
          <!-- Top Row: Current Bid/Sale Card and Current Sale Info -->
          <div class="grid grid-cols-1 md:grid-cols-2 sm:gap-2 md:gap-4">
            <!-- Current Bid Card (shown when user is not seller and no active sale) -->

            <!-- Sale Card (shown when user is seller) -->
            <SaleCard
              v-if="isCurrentUserSeller && !lobbyStore.lobby?.currentSale"
              @sale="handleSale"
              @update:items="sellingItems = $event"
            />
            <CurrentBidCard
              v-else
              :highest-bid="highestBid"
              :highest-bidder="highestBidder"
              :remaining-time="remainingTime"
              @bid="handleBid"
            />

            <!-- Current Sale Info -->
            <NewSaleInfo
              v-if="isCurrentUserSeller && !lobbyStore.lobby?.currentSale"
              :items="sellingItems"
            />
            <CurrentSaleInfo v-else />
          </div>

          <!-- Bottom Row: Player Inventory and Game Rules -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-4">
            <!-- Player Inventory (always shown) -->
            <PlayerInventory />

            <!-- Game Rules (always shown in second column) -->
            <AuctionRules />
          </div>
        </div>

        <!-- Right Sidebar (3 columns on desktop) -->
        <div class="lg:col-span-3 mt-2 md:mt-0">
          <SellerQueue />
        </div>
      </div>
    </div>
  </Background>
</template>

<script lang="ts" setup>
import { useLobbyStore } from '@/stores/lobbyStore.ts'
import { useUserStore } from '@/stores/userStore.ts'
import { useSettingsStore } from '@/stores/settingsStore.ts'
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import GameHeader from '@/components/auction/GameHeader.vue'
import CurrentBidCard from '@/components/auction/CurrentBidCard.vue'
import CurrentSaleInfo from '@/components/auction/CurrentSaleInfo.vue'
import PlayerInventory from '@/components/auction/PlayerInventory.vue'
import SaleCard from '@/components/auction/SaleCard.vue'
import SellerQueue from '@/components/auction/SellerQueue.vue'
import AuctionRules from '@/components/auction/AuctionRules.vue'
import NewSaleInfo from '@/components/auction/NewSaleInfo.vue'
import GameShapes from '@/components/icons/GameShapes.vue'
import Background from '@/components/common/Background.vue'
import { useAuctionService } from '@/composables/useAuctionService.ts'
import { useAuctionTimer } from '@/composables/useAuctionTimer.ts'
import type { NewSaleMsg } from '@auction/common'
import { useAuctionConnection } from '@/composables/useAuctionConnection.ts'
import LobbyLoading from '@/components/lobby/LobbyLoading.vue'
import { useHeaderStore } from '@/stores/headerStore.ts'

const lobbyStore = useLobbyStore()
const auctionService = useAuctionService()
const userStore = useUserStore()
const settingsStore = useSettingsStore()
const router = useRouter()
// Use our auction timer composable
const { remainingTime } = useAuctionTimer()

// Auction state
const highestBid = computed(() => lobbyStore.lobby?.currentBid?.amount || 0)
const highestBidder = computed(() => {
  if (!lobbyStore.lobby?.currentBid) return undefined
  return lobbyStore.users.find((p) => p.id === lobbyStore.lobby?.currentBid?.playerId)
})

// Sale items
const sellingItems = ref([])

// Bid handler
const handleBid = (amount: number) => {
  auctionService.placeBid(amount, lobbyStore.lobby!.currentRound)
}

// Sale handler
const handleSale = (items: NewSaleMsg['sale']['items']) => {
  auctionService.sellItems(items)
}

// Check if current user is the seller
const isCurrentUserSeller = computed(() => {
  return lobbyStore.lobby?.sellerQueue[lobbyStore.sellerIndex] === userStore.user?.id
})
const connection = useAuctionConnection()
if (!lobbyStore.lobby) {
  connection.connect().catch(() => {
    router.push('/join')
  })
}
watch(
  () => lobbyStore.lobby,
  (newLobby) => {
    if (newLobby && !newLobby.startTimestamp) {
      router.push('/lobby')
    }
  },
)
const headerStore = useHeaderStore()
onMounted(() => {
  headerStore.used = true
})
onUnmounted(() => {
  headerStore.used = false
})
</script>
