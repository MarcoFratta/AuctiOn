<template>
  <div class="min-h-screen w-full bg-gray-900 text-white p-2 sm:p-2 lg:p-4 flex flex-col">
    <!-- Top Bar -->
    <div class="flex justify-between items-center mb-4 lg:mb-6">
      <h1 class="text-xl sm:text-2xl font-bold">⚡ Live Auction</h1>
      <div class="flex items-center gap-4">
        <!-- Add any top-right controls here -->
      </div>
    </div>

    <!-- Main Content Area -->
    <div class="grid grid-cols-1 md:grid-cols-12 gap-2 sm:gap-4 lg:gap-6 flex-grow">
      <!-- Left Side - Main Game Area (9 columns) -->
      <div class="col-span-1 md:col-span-9 grid grid-cols-1 gap-2 sm:gap-4">
        <!-- Top Row -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-2 sm:gap-4">
          <!-- Current Bid Card - Takes 2/3 of the width -->
          <div class="lg:col-span-2 order-1">
            <CurrentBidCard
              v-if="!lobbyStore.userIsTheSeller || lobbyStore.lobby?.currentSale"
              :highest-bid="highestBid ?? 0"
              :highest-bidder="highestBidder"
              :remaining-time="remainingTime"
              @bid="bid"
            />
            <SaleCard v-else @sale="submitSale" @update:items="sellingItems = $event" />
          </div>
          <!-- Current Sale Info - Takes 1/3 of the width -->
          <div class="lg:col-span-1 order-first lg:order-2">
            <CurrentSaleInfo v-if="!lobbyStore.userIsTheSeller || lobbyStore.lobby?.currentSale" />
            <NewSaleInfo v-else :current-sale="sellingItems" />
          </div>
        </div>

        <!-- Bottom Row - Inventory -->
        <div>
          <PlayerInventory />
        </div>
      </div>

      <!-- Right Side - Rules & Queue (3 columns) -->
      <div class="col-span-1 md:col-span-3 grid grid-cols-1 gap-2 sm:gap-4">
        <AuctionRules />
        <SellerQueue />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, onUnmounted, ref, watch } from 'vue'
import { useLobbyStore } from '@/stores/lobbyStore.js'
import { useLobbyMsgHandler } from '@/composables/useLobbyMsgHandler.js'
import { useAuctionService } from '@/composables/useAuctionService.js'
import { useUserStore } from '@/stores/userStore.ts'
import AuctionRules from '@/components/auction/AuctionRules.vue'
import SellerQueue from '@/components/auction/SellerQueue.vue'
import CurrentBidCard from '@/components/auction/CurrentBidCard.vue'
import PlayerInventory from '@/components/auction/PlayerInventory.vue'
import SaleCard from '@/components/auction/SaleCard.vue'
import CurrentSaleInfo from '@/components/auction/CurrentSaleInfo.vue'
import NewSaleInfo from '@/components/auction/NewSaleInfo.vue'

const userStore = useUserStore()
const lobbyStore = useLobbyStore()
const msgHandler = useLobbyMsgHandler()
const auctionService = useAuctionService()
msgHandler.connectAndHandle()

// Reactive ref to hold the remaining time for countdown
const remainingTime = ref(0)
let countdownInterval: NodeJS.Timeout | undefined = undefined

// Compute the time left based on the start time and bid time
const updateRemainingTime = () => {
  if (!lobbyStore.timerStart || !lobbyStore.lobby?.bidTime) {
    remainingTime.value = 0
    return
  }

  const elapsedTime = Math.floor((Date.now() - new Date(lobbyStore.timerStart)) / 1000)
  remainingTime.value = Math.max(0, lobbyStore.lobby.bidTime - elapsedTime)
}

// Start countdown timer
const startCountdown = () => {
  if (countdownInterval) clearInterval(countdownInterval) // Clear previous interval

  // Initialize the countdown immediately
  updateRemainingTime()

  // Set up interval to update the remaining time every second
  countdownInterval = setInterval(() => {
    updateRemainingTime()
    if (remainingTime.value <= 0) {
      clearInterval(countdownInterval) // Stop the timer when time runs out
    }
  }, 1000)
}

// Watch for timer changes and restart countdown
watch(
  () => lobbyStore.timerStart,
  () => {
    startCountdown() // Start or restart the countdown whenever the timer changes
  },
  { immediate: true },
)

// Cleanup interval when component is unmounted
onUnmounted(() => {
  if (countdownInterval) clearInterval(countdownInterval)
})

const highestBid = computed(() => lobbyStore.lobby?.currentBid?.amount ?? undefined)
const highestBidder = computed(() =>
  lobbyStore.users.find((user) => user.id === lobbyStore.lobby?.currentBid?.playerId),
)
const totalWeight = computed(() => lobbyStore.lobby?.currentSale?.info?.weight ?? undefined)
const playerMoney = computed(() => lobbyStore.playerInfo?.money ?? 0)
const playerInventory = computed(() => lobbyStore.playerInfo?.inventory)
const sellingItems = ref()

// Function to place a bid
const bid = (amount: number) => {
  if (playerMoney.value < amount) {
    alert('Not enough funds!')
    return
  }
  if (highestBid.value && amount <= highestBid.value) {
    alert('Bid must be higher than the current highest bid.')
    return
  }

  auctionService.placeBid(amount, lobbyStore.lobby!.currentRound)
}

// Function to submit a sale
const submitSale = (saleQuantities: { item: string; quantity: number }[]) => {
  if (!saleQuantities) {
    alert('Select at least one item to sell.')
    return
  }
  const saleList = saleQuantities.filter((item) => item.quantity > 0)
  if (saleList.length === 0) {
    alert('Select at least one item to sell.')
    return
  }
  auctionService.sellItems(saleList)
}
</script>
