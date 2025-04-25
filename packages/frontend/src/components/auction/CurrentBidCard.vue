<script lang="ts" setup>
import { useLobbyStore } from '@/stores/lobbyStore.ts'
import { computed, ref, watch } from 'vue'
import BaseCard from '@/components/common/BaseCard.vue'
import InnerCard from '@/components/common/InnerCard.vue'
import AuctionTimer from '@/components/auction/AuctionTimer.vue'
import SectionHeader from '@/components/common/SectionHeader.vue'
import { useLobbyInfo } from '@/composables/useLobbyInfo.ts'

const lobbyStore = useLobbyStore()
const lobbyInfo = useLobbyInfo()
const props = defineProps<{
  remainingTime: number
}>()

const emits = defineEmits(['bid'])

const { currentBid, highestBidder, isCurrentUserSeller, isHighestBidder, userMoney } = lobbyInfo
// Calculate future balance after sale (for seller)
const futureBalance = computed(() => {
  if (!isCurrentUserSeller.value) return userMoney.value
  return userMoney.value + (currentBid.value?.amount ?? 0)
})

// Check if user can bid (time remaining, not seller, not highest bidder)
const canBid = computed(() => {
  return props.remainingTime > 0 && !isCurrentUserSeller.value && !isHighestBidder.value
})

// Custom bid amount
const customBidAmount = ref<number | null>(null)
const customBidError = ref('')

// Add a ref to track when to show the flash animation
const showInputFlash = ref(false)

// Reset custom bid amount when highest bid changes
watch(
  () => currentBid.value,
  () => {
    customBidAmount.value = null
    customBidError.value = ''
  },
)

const handleCustomBid = () => {
  if (!customBidAmount.value) {
    customBidError.value = 'Please enter a bid amount'
    return
  }

  const bidAmount = Number(customBidAmount.value)
  if (isNaN(bidAmount) || bidAmount <= 0) {
    customBidError.value = 'Please enter a valid amount'
    return
  }

  if (bidAmount <= (currentBid.value?.amount ?? 0)) {
    customBidError.value = 'Bid must be higher than current bid'
    return
  }

  if (bidAmount > userMoney.value) {
    customBidError.value = "You don't have enough money"
    return
  }

  emits('bid', bidAmount)
  customBidAmount.value = null
  customBidError.value = ''
}

// Set quick bid amount to input field
const setQuickBidAmount = (amount: number) => {
  if (canBid.value && isValidBid(amount)) {
    customBidAmount.value = amount
    customBidError.value = ''

    // Trigger flash animation
    showInputFlash.value = true
    setTimeout(() => {
      showInputFlash.value = false
    }, 500) // Animation duration
  }
}

// Check if a quick bid amount is valid (user has enough money)
const isValidBid = (amount: number) => {
  return amount > (currentBid.value?.amount ?? 0) && amount <= userMoney.value
}

// Quick bid options
const quickBidOptions = computed(() => {
  const currentBidValue = currentBid.value?.amount ?? 0

  // If there are no bids yet (currentBid is 0), provide default starting bid options
  if (currentBidValue === 0) {
    return [5, 10, 15, 20]
  }

  // Otherwise, calculate proportional bids based on current highest bid
  return [
    Math.round(currentBidValue * 1.1), // +10%
    Math.round(currentBidValue * 1.25), // +25%
    Math.round(currentBidValue * 1.5), // +50%
    Math.round(currentBidValue * 2), // +100%
  ]
})
</script>

<template>
  <BaseCard class="h-full flex flex-col">
    <!-- Replace the header with the new component -->
    <SectionHeader iconColor="violet" iconName="bid" title="Current Auction">
      <!-- Timer -->
      <div v-if="lobbyStore.lobby?.currentSale">
        <AuctionTimer
          :remaining-time="remainingTime"
          :total-time="lobbyStore.lobby!.bidTime"
          compact
        />
      </div>
    </SectionHeader>

    <!-- Main Content - Modify the InnerCard to handle scrolling properly -->
    <InnerCard class="flex-grow flex flex-col p-1.5 relative">
      <!-- Current Bid Info -->
      <div
        class="bg-app-violet-400/20 dark:bg-app-violet-500/20 rounded-md p-2 mb-2 flex flex-col justify-center items-center flex-grow"
      >
        <!-- Current Bid Amount -->
        <span class="text-app-violet-600 dark:text-app-violet-400 font-bold text-xl xl:text-2xl">
          ${{ currentBid?.amount ?? 0 }}
        </span>

        <!-- Bidder Info -->
        <div class="flex justify-center items-center gap-1">
          <span class="text-neutral-600 dark:text-neutral-400 text-xs">by</span>
          <span class="text-neutral-900 dark:text-white font-medium text-xs">
            {{ highestBidder?.username || 'No bids yet' }}
          </span>
          <!-- "You" tag -->
          <span
            v-if="isHighestBidder"
            class="bg-green-100 dark:bg-green-800/30 text-green-800 dark:text-green-300 text-xs px-1 py-0 rounded-full font-medium"
          >
            You
          </span>
        </div>

        <!-- Status indicator -->
        <div
          v-if="isHighestBidder || isCurrentUserSeller || remainingTime <= 0"
          class="mt-1 text-center text-xs font-medium"
        >
          <span v-if="isHighestBidder" class="text-green-600 dark:text-green-300">
            You are the highest bidder
          </span>
          <span v-else-if="isCurrentUserSeller" class="text-blue-700 dark:text-blue-300">
            You are the seller
          </span>
          <span v-else-if="remainingTime <= 0" class="text-neutral-700 dark:text-neutral-300">
            Waiting for next auction
          </span>
        </div>
      </div>

      <!-- Seller View - Show when user is the seller -->
      <div v-if="isCurrentUserSeller" class="flex flex-col px-2">
        <div class="flex flex-col h-full justify-between">
          <!-- Current Bid Status -->
          <div class="space-y-2">
            <div class="flex justify-between items-center">
              <span class="text-neutral-600 dark:text-neutral-400 text-xs">Current Bid:</span>
              <span class="text-app-violet-600 dark:text-app-violet-400 font-bold">
                ${{ currentBid?.amount ?? 0 }}
              </span>
            </div>

            <div class="flex justify-between items-center">
              <span class="text-neutral-600 dark:text-neutral-400 text-xs">Highest Bidder:</span>
              <span class="text-neutral-900 dark:text-white font-medium text-xs">
                {{ highestBidder?.username || 'No bids yet' }}
              </span>
            </div>

            <div class="border-t border-violet-100 dark:border-violet-800/30 my-2 pt-2">
              <div class="flex justify-between items-center">
                <span class="text-neutral-600 dark:text-neutral-400 text-xs">Current Balance:</span>
                <span class="text-green-600 dark:text-green-400 font-medium">
                  ${{ userMoney }}
                </span>
              </div>

              <div class="flex justify-between items-center">
                <span class="text-neutral-600 dark:text-neutral-400 text-xs">After Sale:</span>
                <span class="text-green-600 dark:text-green-400 font-bold">
                  ${{ futureBalance }}
                  <span class="text-green-500 dark:text-green-300 text-xs ml-1">
                    (+${{ currentBid?.amount ?? 0 }})
                  </span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Quick Bid Options - Only show when not seller -->
      <div v-if="!isCurrentUserSeller" class="mb-2">
        <div class="grid grid-cols-2 gap-1.5">
          <button
            v-for="(amount, index) in quickBidOptions"
            :key="index"
            :class="[
              'py-1 px-1.5 xl:py-2 rounded-md font-medium transition-colors text-xs lg:text-md',
              canBid && isValidBid(amount)
                ? 'bg-app-violet-500 hover:bg-app-violet-600 active:bg-app-violet-700 text-white'
                : 'bg-neutral-100 dark:bg-neutral-800/50 text-neutral-400 dark:text-neutral-500 cursor-not-allowed',
            ]"
            :disabled="!canBid || !isValidBid(amount)"
            :title="
              !canBid
                ? isCurrentUserSeller
                  ? 'You are the seller'
                  : isHighestBidder
                    ? 'You are the highest bidder'
                    : 'Auction ended'
                : amount > userMoney
                  ? 'Not enough money'
                  : `Set bid to $${amount}`
            "
            @click="setQuickBidAmount(amount)"
          >
            ${{ amount }}
          </button>
        </div>
      </div>

      <!-- Bottom section: Custom bid input - Only show when not seller -->
      <div v-if="!isCurrentUserSeller" class="mt-auto">
        <!-- Money available indicator -->
        <div
          class="flex justify-between items-center text-xs text-neutral-500 dark:text-neutral-400 mb-1"
        >
          <span
            >Balance:
            <span class="text-green-600 dark:text-green-400 font-medium"
              >${{ userMoney }}</span
            ></span
          >
          <span v-if="canBid"
            >Min:
            <span class="text-app-violet-600 dark:text-app-violet-400 font-medium"
              >${{ (currentBid?.amount ?? 0) + 1 }}</span
            ></span
          >
        </div>

        <!-- Custom Bid Input - More compact -->
        <div class="flex gap-1.5 items-stretch h-8">
          <div class="relative flex-grow">
            <span
              class="absolute inset-y-0 left-0 flex items-center pl-2 text-neutral-500 dark:text-neutral-400 text-xs"
              >$</span
            >
            <input
              v-model="customBidAmount"
              :class="[
                'w-full pl-6 pr-2 py-1 border rounded-md text-xs outline-none h-full transition-all',
                showInputFlash ? 'flash-border' : '',
                canBid
                  ? 'bg-white dark:bg-neutral-800 border-neutral-300 dark:border-neutral-700/50 text-neutral-900 dark:text-white focus:ring-1 focus:ring-app-violet-500 focus:border-app-violet-500'
                  : 'bg-neutral-100 dark:bg-neutral-800/50 border-neutral-300 dark:border-neutral-700/50 text-neutral-400 dark:text-neutral-500 cursor-not-allowed',
              ]"
              :disabled="!canBid"
              :max="userMoney"
              :placeholder="((currentBid?.amount ?? 0) + 1).toString()"
              min="1"
              type="number"
              @keyup.enter="canBid && handleCustomBid()"
            />
          </div>
          <button
            :class="[
              'py-1 px-3 rounded-md font-medium transition-colors text-xs whitespace-nowrap h-full',
              canBid
                ? 'bg-app-violet-500 hover:bg-app-violet-600 active:bg-app-violet-700 text-white'
                : 'bg-neutral-300 dark:bg-neutral-700/50 text-neutral-500 dark:text-neutral-400 cursor-not-allowed',
            ]"
            :disabled="!canBid"
            @click="canBid && handleCustomBid()"
          >
            Bid
          </button>
        </div>

        <!-- Error message - Smaller fixed height -->
        <div class="h-4 mt-0.5">
          <p v-if="customBidError" class="text-red-500 text-xs">
            {{ customBidError }}
          </p>
        </div>
      </div>
    </InnerCard>
  </BaseCard>
</template>

<style scoped>
/* Prevent number input arrows */
input[type='number']::-webkit-inner-spin-button,
input[type='number']::-webkit-outer-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

input[type='number'] {
  -moz-appearance: textfield;
}

/* Flash animation for the input border */
@keyframes flash-border {
  0% {
    border-color: var(--app-violet-300, #c4b5fd);
    box-shadow: 0 0 0 2px rgba(139, 92, 246, 0.1);
  }
  50% {
    border-color: var(--app-violet-500, #8b5cf6);
    box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.3);
  }
  100% {
    border-color: var(--app-violet-300, #c4b5fd);
    box-shadow: 0 0 0 2px rgba(139, 92, 246, 0.1);
  }
}

.flash-border {
  animation: flash-border 0.5s ease;
  border-color: var(--app-violet-500, #8b5cf6);
}

/* Prevent bounce scrolling on iOS */
.no-bounce {
  -webkit-overflow-scrolling: auto;
  overscroll-behavior: contain;
}
</style>
