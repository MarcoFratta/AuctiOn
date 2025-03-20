<template>
  <div
    class="min-h-screen w-full bg-gradient-to-b from-gray-850 to-gray-950 text-white flex flex-col"
  >
    <!-- Teleport the game status indicators to the header right content slot -->
    <Teleport to="#header-right-content">
      <GameHeader />
    </Teleport>
    <!-- Main Content Area -->
    <div
      class="flex-1 w-full flex flex-col lg:grid lg:grid-cols-12 gap-4 mb-4 sm:px-4 pb-16 sm:pb-3"
    >
      <!-- Left and Center Content (9 columns on desktop) -->
      <div class="lg:col-span-9 flex flex-col gap-4">
        <!-- Top Row with Bid/Sale Card and Sale Info -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <!-- Current Bid/Sale Card - Takes 2/3 of the width on desktop -->
          <div class="md:col-span-2 flex">
            <transition mode="out-in" name="fade">
              <CurrentBidCard
                v-if="!lobbyStore.userIsTheSeller || lobbyStore.lobby?.currentSale"
                :highest-bid="highestBid ?? 0"
                :highest-bidder="highestBidder"
                :remaining-time="remainingTime"
                class="w-full transform hover:scale-[1.01] transition-transform"
                @bid="bid"
              />
              <SaleCard
                v-else
                class="w-full transform hover:scale-[1.01] transition-transform"
                @sale="submitSale"
                @update:items="sellingItems = $event"
              />
            </transition>
          </div>

          <!-- Current Sale Info - Takes 1/3 of the width on desktop -->
          <div class="md:col-span-1 flex">
            <transition mode="out-in" name="fade">
              <CurrentSaleInfo
                v-if="!lobbyStore.userIsTheSeller || lobbyStore.lobby?.currentSale"
                class="w-full transform hover:scale-[1.01] transition-transform"
              />
              <NewSaleInfo
                v-else
                :current-sale="sellingItems"
                class="w-full transform hover:scale-[1.01] transition-transform"
              />
            </transition>
          </div>
        </div>

        <!-- Bottom Row - Inventory (full width of left section) -->
        <div class="transform hover:scale-[1.01] transition-transform">
          <PlayerInventory />
        </div>
      </div>

      <!-- Right Side - Rules & Queue (3 columns on desktop) -->
      <div class="lg:col-span-3 flex flex-col gap-4">
        <div class="transform hover:scale-[1.01] transition-transform">
          <AuctionRules />
        </div>
        <div class="transform hover:scale-[1.01] transition-transform">
          <SellerQueue />
        </div>
      </div>
    </div>

    <!-- Game Notifications -->
    <div class="fixed bottom-4 right-4 z-50">
      <transition-group name="notification">
        <!-- Notification would go here -->
      </transition-group>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, onUnmounted, ref, watch } from 'vue'
import { useLobbyStore } from '@/stores/lobbyStore.ts'
import { useAuctionService } from '@/composables/useAuctionService.ts'
import CurrentBidCard from '@/components/auction/CurrentBidCard.vue'
import CurrentSaleInfo from '@/components/auction/CurrentSaleInfo.vue'
import PlayerInventory from '@/components/auction/PlayerInventory.vue'
import AuctionRules from '@/components/auction/AuctionRules.vue'
import SellerQueue from '@/components/auction/SellerQueue.vue'
import SaleCard from '@/components/auction/SaleCard.vue'
import NewSaleInfo from '@/components/auction/NewSaleInfo.vue'
import GameHeader from '@/components/auction/GameHeader.vue'

const lobbyStore = useLobbyStore()
const auctionService = useAuctionService()

// Reactive ref to hold the remaining time for countdown
const remainingTime = ref(0)
let countdownInterval: NodeJS.Timeout | undefined = undefined

// Compute the time left based on the start time and bid time
const updateRemainingTime = () => {
  if (!lobbyStore.timerStart || !lobbyStore.lobby?.bidTime) {
    remainingTime.value = 0
    return
  }

  const elapsedTime = Math.floor((Date.now() - new Date(lobbyStore.timerStart).getTime()) / 1000)
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
const playerMoney = computed(() => lobbyStore.playerInfo?.money ?? 0)
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

<style scoped>
/* Transitions */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.notification-enter-active,
.notification-leave-active {
  transition: all 0.3s ease;
}

.notification-enter-from,
.notification-leave-to {
  opacity: 0;
  transform: translateY(30px);
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .container {
    padding-left: 0.75rem;
    padding-right: 0.75rem;
  }
}
</style>
