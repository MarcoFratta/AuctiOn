<script lang="ts" setup>
import { useLobbyStore } from '@/stores/lobbyStore.ts'
import { useUserStore } from '@/stores/userStore.ts'
import { computed, ref, watch } from 'vue'
import BaseCard from '@/components/BaseCard.vue'
import InnerCard from '@/components/InnerCard.vue'

const userStore = useUserStore()
const lobbyStore = useLobbyStore()

const props = defineProps<{
  remainingTime: number
}>()
const highestBidder = computed(() =>
  lobbyStore.getUser(lobbyStore.lobby?.currentBid?.playerId ?? ''),
)
const emits = defineEmits(['bid'])
const highestBid = computed(() => lobbyStore.lobby?.currentBid?.amount ?? 0)

// Get user's current money
const userMoney = computed(() => lobbyStore.playerInfo?.money || 0)

// Check if current user is the highest bidder
const isHighestBidder = computed(() => {
  return highestBidder.value?.id === userStore.user?.id
})

// Check if user is the seller
const isCurrentSeller = computed(() => {
  return lobbyStore.lobby?.sellerQueue[lobbyStore.sellerIndex] === userStore.user?.id
})

// Check if user can bid (time remaining, not seller, not highest bidder)
const canBid = computed(() => {
  return props.remainingTime > 0 && !isCurrentSeller.value && !isHighestBidder.value
})

// Custom bid amount
const customBidAmount = ref<number | null>(null)
const customBidError = ref('')

// Reset custom bid amount when highest bid changes
watch(
  () => highestBid,
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

  if (bidAmount <= highestBid.value) {
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

// Check if a quick bid amount is valid (user has enough money)
const isValidBid = (amount: number) => {
  return amount > highestBid.value && amount <= userMoney.value
}

// Quick bid options
const quickBidOptions = computed(() => {
  const currentBid = highestBid.value

  // If there are no bids yet (currentBid is 0), provide default starting bid options
  if (currentBid === 0) {
    return [5, 10, 15, 20]
  }

  // Otherwise, calculate proportional bids based on current highest bid
  return [
    Math.round(currentBid * 1.1), // +10%
    Math.round(currentBid * 1.25), // +25%
    Math.round(currentBid * 1.5), // +50%
    Math.round(currentBid * 2), // +100%
  ]
})

const formatTimeRemaining = (seconds: number): string => {
  if (seconds <= 0) return '0:00'
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

const timeClass = computed(() => {
  if (props.remainingTime <= 5) return 'text-red-500 dark:text-red-400'
  if (props.remainingTime <= 15) return 'text-yellow-500 dark:text-yellow-400'
  return 'text-green-500 dark:text-green-400'
})
</script>

<template>
  <BaseCard class="h-full flex flex-col">
    <!-- Header -->
    <div class="flex items-center gap-2 mb-2 md:mb-3">
      <div class="bg-blue-100 dark:bg-app-violet-500/20 p-1.5 md:p-2 rounded-lg">
        <svg
          class="h-4 w-4 md:h-5 md:w-5 text-blue-500 dark:text-app-violet-300"
          fill="currentColor"
          viewBox="0 0 20 20"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            clip-rule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-14a3 3 0 00-3 3v2H7a1 1 0 000 2h1v1a1 1 0 01-1 1 1 1 0 100 2h6a1 1 0 100-2H9.83c.11-.313.17-.65.17-1v-1h1a1 1 0 100-2h-1V7a1 1 0 112 0 1 1 0 102 0 3 3 0 00-3-3z"
            fill-rule="evenodd"
          />
        </svg>
      </div>
      <h2 class="text-lg md:text-xl font-semibold text-zinc-900 dark:text-white">
        Current Auction
      </h2>

      <!-- Timer -->
      <div v-if="lobbyStore.lobby?.currentSale" class="ml-auto flex items-center gap-1 md:gap-2">
        <svg
          :class="[
            'h-4 w-4 md:h-5 md:w-5',
            remainingTime <= 5
              ? 'text-red-500 dark:text-red-400 timer-urgent'
              : remainingTime <= 15
                ? 'text-yellow-500 dark:text-yellow-400 timer-warning'
                : 'text-gray-500 dark:text-gray-400',
          ]"
          fill="currentColor"
          viewBox="0 0 20 20"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            clip-rule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
            fill-rule="evenodd"
          />
        </svg>
        <span
          :class="[
            timeClass,
            'font-mono font-bold text-sm md:text-base',
            remainingTime <= 5
              ? 'timer-pulse-urgent'
              : remainingTime <= 15
                ? 'timer-pulse-warning'
                : '',
          ]"
        >
          {{ formatTimeRemaining(remainingTime) }}
        </span>

        <!-- Timer progress bar -->
        <div
          v-if="remainingTime > 0"
          class="timer-progress-container ml-1 h-4 w-12 md:w-16 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700"
        >
          <div
            :class="[
              remainingTime <= 5
                ? 'bg-red-500 dark:bg-red-600 timer-progress-urgent'
                : remainingTime <= 15
                  ? 'bg-yellow-500 dark:bg-yellow-600 timer-progress-warning'
                  : 'bg-green-500 dark:bg-green-600',
            ]"
            :style="{
              width: `${Math.min(100, (remainingTime / lobbyStore.lobby!.bidTime) * 100)}%`,
            }"
            class="timer-progress h-full"
          ></div>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <InnerCard class="flex-grow p-2 md:p-3">
      <!-- Current Bid Info -->
      <div class="mb-3 md:mb-4">
        <div class="flex justify-between items-center mb-1">
          <span class="text-gray-600 dark:text-gray-400 text-xs md:text-sm">Current Bid</span>
          <span class="text-gray-900 dark:text-white font-bold text-lg md:text-xl"
            >${{ highestBid }}</span
          >
        </div>
        <div class="flex justify-between items-center">
          <span class="text-gray-600 dark:text-gray-400 text-xs md:text-sm">Highest Bidder</span>
          <div class="flex items-center gap-1.5">
            <span class="text-gray-900 dark:text-white font-medium text-sm md:text-base">
              {{ highestBidder?.username || 'No bids yet' }}
            </span>
            <!-- "You" tag when user is highest bidder -->
            <span
              v-if="isHighestBidder"
              class="bg-green-100 dark:bg-green-500/20 text-green-800 dark:text-green-300 text-xs px-1.5 py-0.5 rounded-full border border-green-200 dark:border-green-500/30 font-medium"
            >
              You
            </span>
          </div>
        </div>
      </div>

      <!-- Bidding Controls - Always show but disable when needed -->
      <div class="space-y-3 md:space-y-4">
        <!-- Quick Bid Options -->
        <div>
          <div class="grid grid-cols-2 gap-1.5 md:gap-2">
            <button
              v-for="(amount, index) in quickBidOptions"
              :key="index"
              :class="[
                'py-1.5 md:py-2 px-2 md:px-3 rounded-md font-medium transition-colors text-xs md:text-sm',
                isValidBid(amount) && remainingTime > 0 && !isCurrentSeller
                  ? 'bg-app-violet-500/20 hover:bg-app-violet-500/30 text-app-violet-500 dark:text-app-violet-300'
                  : 'bg-gray-100 dark:bg-gray-700/30 text-gray-400 dark:text-gray-500 cursor-not-allowed',
              ]"
              :disabled="
                !isValidBid(amount) || remainingTime <= 0 || isCurrentSeller || isHighestBidder
              "
              :title="
                remainingTime <= 0
                  ? 'Auction ended'
                  : isCurrentSeller
                    ? 'You are the seller'
                    : isHighestBidder
                      ? 'You are the highest bidder'
                      : amount > userMoney
                        ? 'Not enough money'
                        : ''
              "
              @click="
                isValidBid(amount) &&
                remainingTime > 0 &&
                !isCurrentSeller &&
                !isHighestBidder &&
                emits('bid', amount)
              "
            >
              ${{ amount }}
            </button>
          </div>
        </div>

        <!-- Custom Bid Input -->
        <div>
          <div class="text-gray-600 dark:text-gray-400 text-xs md:text-sm mb-1.5 md:mb-2">
            Custom Bid
          </div>
          <div class="flex gap-1.5 md:gap-2">
            <div class="relative flex-grow">
              <span
                class="absolute inset-y-0 left-0 flex items-center pl-2 md:pl-3 text-gray-500 dark:text-gray-400 text-sm md:text-base"
                >$</span
              >
              <input
                v-model="customBidAmount"
                :class="[
                  'w-full pl-6 md:pl-7 pr-2 md:pr-3 py-1.5 md:py-2 border rounded-md text-sm md:text-base outline-none',
                  remainingTime > 0 && !isCurrentSeller && !isHighestBidder
                    ? 'bg-white dark:bg-gray-700/50 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 dark:focus:ring-app-violet-500 focus:border-blue-500 dark:focus:border-app-violet-500'
                    : 'bg-gray-100 dark:bg-gray-800/50 border-gray-300 dark:border-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed',
                ]"
                :disabled="remainingTime <= 0 || isCurrentSeller || isHighestBidder"
                :max="userMoney"
                :placeholder="(highestBid + 1).toString()"
                min="1"
                type="number"
                @keyup.enter="
                  remainingTime > 0 && !isCurrentSeller && !isHighestBidder && handleCustomBid()
                "
              />
            </div>
            <button
              :class="[
                'py-1.5 md:py-2 px-3 md:px-4 rounded-md font-medium transition-colors text-xs md:text-sm',
                remainingTime > 0 && !isCurrentSeller && !isHighestBidder
                  ? 'bg-blue-500 hover:bg-blue-600 active:bg-blue-700 dark:bg-app-violet-600 dark:hover:bg-app-violet-700 dark:active:bg-app-violet-800 text-white'
                  : 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed',
              ]"
              :disabled="remainingTime <= 0 || isCurrentSeller || isHighestBidder"
              @click="
                remainingTime > 0 && !isCurrentSeller && !isHighestBidder && handleCustomBid()
              "
            >
              Bid
            </button>
          </div>
          <p v-if="customBidError" class="text-red-500 text-xs mt-1">{{ customBidError }}</p>
        </div>
      </div>

      <!-- Status Messages -->
      <div v-if="isHighestBidder" class="mt-3 text-center">
        <p class="text-green-600 dark:text-green-400 text-xs md:text-sm font-medium">
          You are currently the highest bidder
        </p>
      </div>
      <div v-else-if="isCurrentSeller" class="mt-3 text-center">
        <p class="text-blue-600 dark:text-blue-400 text-xs md:text-sm font-medium">
          You are the seller in this auction
        </p>
      </div>
      <div v-else-if="remainingTime <= 0" class="mt-3 text-center">
        <p class="text-gray-600 dark:text-gray-400 text-xs md:text-sm font-medium">
          Waiting for next auction...
        </p>
      </div>
    </InnerCard>
  </BaseCard>
</template>

<style scoped>
.pulse-animation {
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% {
    opacity: 0.1;
  }
  50% {
    opacity: 0.2;
  }
  100% {
    opacity: 0.1;
  }
}

/* Timer animations */
.timer-urgent {
  animation: shake 0.5s infinite;
}

.timer-warning {
  animation: pulse-warning 1s infinite;
}

.timer-pulse-urgent {
  animation: pulse-urgent 0.5s infinite;
}

.timer-pulse-warning {
  animation: pulse-warning 1.5s infinite;
}

.timer-progress-urgent {
  animation: progress-flash 0.5s infinite;
}

.timer-progress-warning {
  animation: progress-pulse 1.5s infinite;
}

@keyframes shake {
  0%,
  100% {
    transform: translateX(0);
  }
  25% {
    transform: translateX(-1px);
  }
  75% {
    transform: translateX(1px);
  }
}

@keyframes pulse-urgent {
  0%,
  100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.8;
    transform: scale(1.05);
  }
}

@keyframes pulse-warning {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
}

@keyframes progress-flash {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.6;
  }
}

@keyframes progress-pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.8;
  }
}

/* Timer progress bar */
.timer-progress-container {
  position: relative;
  transition: all 1s ease;
}

.timer-progress {
  transition: width 0.2s linear;
}

/* Prevent number input arrows */
input[type='number']::-webkit-inner-spin-button,
input[type='number']::-webkit-outer-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

input[type='number'] {
  -moz-appearance: textfield;
}
</style>
