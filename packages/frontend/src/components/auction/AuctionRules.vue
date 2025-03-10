<script lang="ts" setup>
import { useLobbyStore } from '@/stores/lobbyStore.ts'

const lobbyStore = useLobbyStore()
</script>

<template>
  <div class="bg-gray-800 p-4 lg:p-6 rounded-lg shadow-lg h-full">
    <!-- Header -->
    <div class="flex items-center justify-between mb-4">
      <h2 class="text-xl font-bold text-white">🎮 Game Rules</h2>
      <div class="bg-gray-700 px-3 py-1 rounded-full align-middle flex items-center justify-center">
        <span class="text-gray-400 align-middle"
          >Round
          <span class="text-yellow-400 font-bold">
            {{ lobbyStore.lobby?.currentRound ?? 0 }}/{{ lobbyStore.lobby?.maxRound }}
          </span>
        </span>
      </div>
    </div>

    <!-- Game Rules Section -->
    <div class="bg-gray-700 p-4 rounded-lg">
      <div class="space-y-4">
        <!-- Weights -->
        <div>
          <p class="text-gray-400 mb-2 text-sm font-medium">Item Weights:</p>
          <ul class="grid grid-cols-1 gap-2">
            <li
              v-for="item in lobbyStore.weights"
              :key="item.item"
              class="flex items-center justify-between bg-gray-800 p-2 rounded"
            >
              <span class="text-gray-300 flex items-center gap-2">
                <div :class="item.color" class="w-6 h-6" v-html="item.svg"></div>
                {{ item.item }}
              </span>
              <span class="text-orange-400 font-bold">{{ item.weight }}</span>
            </li>
          </ul>
        </div>

        <!-- Bid Time -->
        <div>
          <p class="text-gray-400 text-sm font-medium">Bid Timer:</p>
          <p class="text-blue-400 bg-gray-800 p-2 rounded mt-1">
            ⏱️ {{ lobbyStore.lobby?.bidTime ?? '' }} seconds
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
