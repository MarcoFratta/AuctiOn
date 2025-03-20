<script lang="ts" setup>
import { type Player, useLobbyStore } from '@/stores/lobbyStore.ts'
import { useUserStore } from '@/stores/userStore.ts'
import { computed, ref } from 'vue'

const userStore = useUserStore()
const lobbyStore = useLobbyStore()

const props = defineProps<{
  remainingTime: number
  highestBid: number
  highestBidder: Player | undefined
}>()

const emits = defineEmits(['bid'])
const canBid = computed(() => {
  return (
    props.remainingTime > 0 &&
    lobbyStore.lobby?.sellerQueue[lobbyStore.sellerIndex] !== userStore.user?.id &&
    props.highestBidder?.id !== userStore.user?.id
  )
})

// Custom bid amount
const customBidAmount = ref<number | null>(null)
const customBidError = ref('')

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

  if (props.highestBid && bidAmount <= props.highestBid) {
    customBidError.value = 'Bid must be higher than current bid'
    return
  }

  emits('bid', bidAmount)
  customBidAmount.value = null
  customBidError.value = ''
}
</script>

<template>
  <div
    class="bg-gray-800 p-3 lg:p-6 rounded-lg shadow-lg h-full flex flex-col relative overflow-hidden"
  >
    <!-- Pulsing background when time is low -->
    <div
      v-if="remainingTime > 0 && remainingTime <= 5"
      class="absolute inset-0 bg-red-500 opacity-10 pulse-animation"
    ></div>

    <!-- Header with Timer -->
    <div class="flex items-center justify-between mb-3 lg:mb-5 relative z-10">
      <h2 class="text-lg lg:text-2xl font-bold text-white flex items-center">
        <span class="mr-2">🔥</span> Current Bid
      </h2>
      <div
        v-if="remainingTime > 0"
        class="bg-gray-700 px-3 py-1.5 lg:px-4 lg:py-2 rounded-full flex items-center"
      >
        <span
          :class="remainingTime >= 5 ? 'text-yellow-400' : 'text-red-500 animate-pulse'"
          class="font-medium text-sm lg:text-lg flex items-center"
        >
          <span class="mr-1.5">⏳</span>{{ remainingTime }}s
        </span>
      </div>
    </div>

    <!-- Main Bid Info -->
    <div
      class="bg-gray-700 p-4 lg:p-6 rounded-md mb-3 lg:mb-5 flex-grow relative z-10 md:max-h-[150px] lg:max-h-none"
    >
      <div class="grid grid-cols-1 gap-3 lg:gap-5 h-full flex flex-col justify-center">
        <!-- Current Bid Amount -->
        <div class="flex flex-col">
          <span class="text-gray-400 text-sm lg:text-lg mb-1">Current Bid</span>
          <span class="text-green-400 text-2xl lg:text-4xl font-bold">
            ${{ highestBid || 0 }}
          </span>
        </div>

        <!-- Bidder Information -->
        <div class="flex flex-col">
          <span class="text-gray-400 text-sm lg:text-lg mb-1">Current Bidder</span>
          <div class="flex items-center">
            <span
              :class="highestBidder ? 'text-blue-400' : 'text-gray-500'"
              class="text-base lg:text-xl font-medium flex items-center"
            >
              <span v-if="highestBidder" class="w-2.5 h-2.5 rounded-full bg-green-500 mr-2"></span>
              {{ highestBidder?.username || 'No bids yet' }}
            </span>
            <span
              v-if="highestBidder?.id === userStore.user?.id"
              class="text-white text-xs lg:text-sm ml-2 bg-yellow-500 bg-opacity-20 px-2 py-0.5 rounded-full"
            >
              You
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Custom Bid Input -->
    <div v-if="canBid" class="mb-3 relative z-10">
      <div class="flex gap-2">
        <div class="relative flex-grow">
          <span class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">$</span>
          <input
            v-model="customBidAmount"
            class="w-full bg-gray-700 border border-gray-600 rounded-md py-2 pl-7 pr-3 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
            min="1"
            placeholder="Custom amount"
            type="number"
          />
        </div>
        <button
          :class="customBidAmount ? 'bg-blue-500 hover:bg-blue-600' : 'bg-gray-600'"
          :disabled="!customBidAmount"
          class="px-4 py-2 rounded-md font-semibold text-white transition-all"
          @click="handleCustomBid"
        >
          Bid
        </button>
      </div>
      <p v-if="customBidError" class="text-red-400 text-xs mt-1">{{ customBidError }}</p>
    </div>

    <!-- Bid Controls -->
    <div class="grid grid-cols-3 gap-2 lg:gap-4 mt-auto relative z-10">
      <button
        v-for="amount in [5, 10, 15]"
        :key="amount"
        :class="
          canBid
            ? 'bg-blue-500 hover:bg-blue-600 active:bg-blue-700 transform active:scale-95'
            : 'bg-gray-600'
        "
        :disabled="!canBid"
        class="p-2 lg:p-4 rounded-md font-semibold text-white text-sm lg:text-lg transition-all shadow-md"
        @click="emits('bid', highestBid ? highestBid + amount : amount)"
      >
        +${{ amount }}
      </button>
    </div>

    <!-- Bid Status Messages -->
    <div
      v-if="highestBidder?.id === userStore.user?.id"
      class="mt-3 lg:mt-4 text-center bg-green-500 bg-opacity-20 p-2 lg:p-3 rounded-md relative z-10"
    >
      <p class="text-white text-xs lg:text-base flex items-center justify-center">
        <span class="mr-2">🏆</span> You are currently the highest bidder!
      </p>
    </div>
    <div
      v-else-if="remainingTime === 0"
      class="mt-3 lg:mt-4 text-center bg-gray-700 p-2 lg:p-3 rounded-md relative z-10"
    >
      <p class="text-gray-400 text-xs lg:text-base flex items-center justify-center">
        <span class="mr-2">⌛</span> Waiting for next auction...
      </p>
    </div>
  </div>
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
