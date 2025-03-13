<template>
  <div class="min-h-screen bg-gray-900 p-4 lg:p-6">
    <!-- Welcome Section -->
    <div class="max-w-4xl mx-auto text-center mb-12">
      <h1 class="text-4xl lg:text-5xl font-bold text-white mb-4">⚡ Welcome to Auction Game</h1>
      <p class="text-gray-400 text-lg">
        Join exciting auctions, trade items, and compete with other players!
      </p>
    </div>

    <!-- Action Cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
      <!-- Create Lobby Card -->
      <div class="bg-gray-800 rounded-lg p-6 shadow-lg">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-xl font-bold text-white">🎮 Create Lobby</h2>
          <div class="bg-blue-500 bg-opacity-20 px-3 py-1 rounded-full">
            <span class="text-white font-medium">Host</span>
          </div>
        </div>
        <p class="text-gray-400 mb-6">Create your own auction lobby and invite friends to join.</p>
        <button
          class="w-full py-3 px-4 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-md transition-colors"
          @click="createLobby"
        >
          Create New Lobby
        </button>
      </div>

      <!-- Join Lobby Card -->
      <div class="bg-gray-800 rounded-lg p-6 shadow-lg">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-xl font-bold text-white">🔍 Join Lobby</h2>
          <div class="bg-green-500 bg-opacity-20 px-3 py-1 rounded-full">
            <span class="text-white font-medium">Player</span>
          </div>
        </div>
        <p class="text-gray-400 mb-6">Join an existing auction lobby and start bidding.</p>
        <button
          class="w-full py-3 px-4 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-md transition-colors"
          @click="joinLobby"
        >
          Join Existing Lobby
        </button>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { useAuthStore } from '@/stores/authStore'
import { useRouter } from 'vue-router'

const authStore = useAuthStore()
const router = useRouter()

const createLobby = () => {
  router.push('/create')
}

const joinLobby = () => {
  router.push('/join')
}
</script>
