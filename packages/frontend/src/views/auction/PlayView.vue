<template>
  <MobileBottomBar
    v-if="lobbyStore.lobby"
    :remaining-time="remainingTime"
    :total-time="lobbyStore.lobby!.bidTime"
  />
  <Background container-class="justify-start sm:justify-center h-full md:p-2">
    <!-- Teleport for desktop header content only -->
    <Teleport v-if="lobbyStore.lobby" class="hidden lg:block" to="#header-right-content">
      <GameHeader />
    </Teleport>
    <!-- Mobile Bottom Bar at the top -->
    <LobbyLoading v-if="!lobbyStore.lobby" />

    <!-- Main Content Area - Responsive height handling -->
    <div v-else class="flex flex-col w-full h-full">
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
      <!-- Mobile and Tablet layout -->
      <div
        class="md:hidden flex flex-col justify-start mb-12 sm:gap-2 md:gap-4 overflow-auto overscroll-contain scrollbar-hide pt-1 flex-grow"
      >
        <!-- Top Row: Current Bid/Sale Card and Current Sale Info -->
        <div class="grid grid-cols-1 md:grid-cols-2 sm:gap-2 md:gap-4">
          <!-- Current Bid Card or Sale Card - with fixed height -->
          <div v-if="isCurrentUserSeller && !lobbyStore.lobby?.currentSale">
            <SaleCard
              class="h-full max-h-[320px]"
              @sale="handleSale"
              @update:items="sellingItems = $event"
            />
          </div>
          <CurrentBidCard
            v-else
            :highest-bid="currentBid"
            :highest-bidder="highestBidder"
            :remaining-time="remainingTime"
            class="h-full"
            @bid="handleBid"
          />

          <!-- Current Sale Info - with fixed height -->
          <NewSaleInfo
            v-if="isCurrentUserSeller && !lobbyStore.lobby?.currentSale"
            :items="sellingItems"
          />
          <CurrentSaleInfo v-else class="h-full" />
        </div>

        <!-- Auction Stats -->
        <AuctionStats class="h-full max-h-[350px]" />

        <!-- Player Inventory - with fixed height -->
        <PlayerInventory class="h-full max-h-[300px]" />

        <!-- Seller Queue - with fixed height -->
        <SellerQueue class="h-full max-h-[350px]" />
      </div>

      <!-- Desktop layout - Full height with 60/40 split -->
      <div
        class="hidden md:grid md:grid-cols-12 gap-3 px-2 h-full md:grid-rows-[minmax(300px,55%)_minmax(250px,45%)]"
      >
        <!-- Top row: Current Auction/Sale and Auction Stats (60%) -->
        <div class="col-span-12 md:col-span-6 lg:col-span-4 h-full">
          <!-- Current Bid Card or Sale Card -->
          <SaleCard
            v-if="isCurrentUserSeller && !lobbyStore.lobby?.currentSale"
            class="h-full"
            @sale="handleSale"
            @update:items="sellingItems = $event"
          />
          <CurrentBidCard
            v-else
            :highest-bid="currentBid"
            :highest-bidder="highestBidder"
            :remaining-time="remainingTime"
            class="h-full"
            @bid="handleBid"
          />
        </div>

        <div class="col-span-12 md:col-span-6 lg:col-span-8 h-full">
          <!-- Auction Stats - wider -->
          <AuctionStats class="h-full" />
        </div>

        <!-- Bottom row: Current Sale Info, Player Inventory, and Seller Queue (40%) -->
        <div class="col-span-12 md:col-span-4 h-full">
          <!-- Current Sale Info -->
          <NewSaleInfo
            v-if="isCurrentUserSeller && !lobbyStore.lobby?.currentSale"
            :items="sellingItems"
            class="h-full"
          />
          <CurrentSaleInfo v-else class="h-full" />
        </div>

        <div class="col-span-12 md:col-span-4 h-full">
          <!-- Player Inventory -->
          <PlayerInventory class="h-full" />
        </div>

        <div class="col-span-12 md:col-span-4 h-full">
          <!-- Seller Queue -->
          <SellerQueue class="h-full" />
        </div>
      </div>
    </div>
  </Background>
</template>

<script lang="ts" setup>
import { useLobbyStore } from '@/stores/lobbyStore.ts'
import { useSettingsStore } from '@/stores/settingsStore.ts'
import { onMounted, onUnmounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import GameHeader from '@/components/auction/GameHeader.vue'
import CurrentBidCard from '@/components/auction/CurrentBidCard.vue'
import CurrentSaleInfo from '@/components/auction/CurrentSaleInfo.vue'
import PlayerInventory from '@/components/auction/PlayerInventory.vue'
import SaleCard from '@/components/auction/SaleCard.vue'
import SellerQueue from '@/components/auction/SellerQueue.vue'
import NewSaleInfo from '@/components/auction/NewSaleInfo.vue'
import GameShapes from '@/components/icons/GameShapes.vue'
import Background from '@/components/common/Background.vue'
import { useAuctionService } from '@/composables/useAuctionService.ts'
import { useAuctionTimer } from '@/composables/useAuctionTimer.ts'
import type { NewSaleMsg } from '@auction/common'
import { useAuctionConnection } from '@/composables/useAuctionConnection.ts'
import LobbyLoading from '@/components/lobby/LobbyLoading.vue'
import { useHeaderStore } from '@/stores/headerStore.ts'
import AuctionStats from '@/components/auction/AuctionStats.vue'
import MobileBottomBar from '@/components/auction/MobileBottomBar.vue'
import { useAlert } from '@/composables/useAlert.ts'
import { useResultsStore } from '@/stores/resultsStore.ts'
import { useSocketStore } from '@/stores/socketStore.ts'
import { useLobbyInfo } from '@/composables/useLobbyInfo.ts'

const lobbyStore = useLobbyStore()
const auctionService = useAuctionService()
const settingsStore = useSettingsStore()
const lobbyInfo = useLobbyInfo()
const router = useRouter()
// Use our auction timer composable
const { remainingTime } = useAuctionTimer()
const { currentBid, highestBidder, isCurrentUserSeller } = lobbyInfo

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

const connection = useAuctionConnection()
if (!lobbyStore.lobby) {
  connection
    .connect()
    .then(undefined)
    .catch(() => {
      router.push('/join')
    })
}
const alerts = useAlert()
const resultsStore = useResultsStore()
const socketStore = useSocketStore()
const lobbyId = ref(lobbyStore.lobby?.id || '')
watch(
  () => lobbyStore.lobby,
  (newLobby) => {
    if (newLobby) {
      if (!newLobby.startTimestamp) {
        router.push('/lobby')
      }
      lobbyId.value = newLobby.id
    }
  },
)
watch(
  () => socketStore.isConnected,
  (connected) => {
    if (!connected && (!resultsStore.leaderboard || resultsStore.auctionId !== lobbyId.value)) {
      alerts.error('Disconnected', `You have been disconnected from the game`)
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
