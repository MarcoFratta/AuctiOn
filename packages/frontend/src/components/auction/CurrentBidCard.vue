<script lang="ts" setup>
import { type Player, useLobbyStore } from '@/stores/lobbyStore.ts'
import { useUserStore } from '@/stores/userStore.ts'
import { computed } from 'vue'

const userStore = useUserStore()
const lobbyStore = useLobbyStore()

const props = defineProps<{
  remainingTime: number
  highestBid: number
  highestBidder: Player | undefined
}>()

const emits = defineEmits(['bid'])
const canBid = computed(() => {
  console.log('seller index is', lobbyStore.sellerIndex)
  console.log('seller queue is', lobbyStore.lobby?.sellerQueue)
  console.log('user id is', userStore.user?.id)
  return (
    props.remainingTime > 0 &&
    lobbyStore.lobby?.sellerQueue[lobbyStore.sellerIndex] !== userStore.user?.id &&
    props.highestBidder?.id !== userStore.user?.id
  )
})
</script>

<template>
  <div class="bg-gray-800 p-4 lg:p-6 rounded-lg shadow-lg flex flex-col h-full">
    <!-- Header with Timer -->
    <div class="flex items-center justify-between mb-4">
      <h2 class="text-xl font-bold text-white">🔥 Current Bid</h2>
      <div v-if="remainingTime > 0" class="bg-gray-700 px-3 py-1 rounded-full">
        <span :class="remainingTime >= 5 ? 'text-yellow-400' : 'text-red-500'" class="font-medium">
          ⏳ {{ remainingTime }}s
        </span>
      </div>
    </div>

    <!-- Main Bid Info -->
    <div class="bg-gray-700 p-4 rounded-md mb-4">
      <div class="grid grid-cols-1 gap-4">
        <!-- Current Bid Amount -->
        <div class="flex flex-col">
          <span class="text-gray-400 text-sm">Current Bid</span>
          <span class="text-green-400 text-2xl font-bold">${{ highestBid || 0 }}</span>
        </div>

        <!-- Bidder Information -->
        <div class="flex flex-col">
          <span class="text-gray-400 text-sm">Current Bidder</span>
          <span class="text-blue-400 text-lg font-medium">
            {{ highestBidder?.username || 'No bids yet' }}
            <span
              v-if="highestBidder?.id === userStore.user?.id"
              class="text-yellow-400 text-sm ml-2"
              >(You)</span
            >
          </span>
        </div>
      </div>
    </div>

    <!-- Bid Controls -->
    <div class="grid grid-cols-3 gap-3 mt-auto">
      <button
        v-for="amount in [5, 10, 15]"
        :key="amount"
        :class="canBid ? 'bg-blue-500 hover:bg-blue-600' : 'bg-gray-600'"
        :disabled="!canBid"
        class="p-3 rounded-md font-semibold text-white text-lg transition-all"
        @click="emits('bid', highestBid ? highestBid + amount : amount)"
      >
        +${{ amount }}
      </button>
    </div>

    <!-- Bid Status Messages -->
    <div
      v-if="highestBidder?.id === userStore.user?.id"
      class="mt-4 text-center bg-green-500 bg-opacity-20 p-2 rounded-md"
    >
      <p class="text-white">You are currently the highest bidder!</p>
    </div>
    <div v-else-if="remainingTime === 0" class="mt-4 text-center bg-gray-700 p-2 rounded-md">
      <p class="text-gray-400">Waiting</p>
    </div>
  </div>
</template>
