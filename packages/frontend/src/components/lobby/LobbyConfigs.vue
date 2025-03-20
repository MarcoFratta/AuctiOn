<template>
  <div class="w-full">
    <h3 class="text-lg font-semibold text-white mb-4">⚙️ Game Settings</h3>

    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <!-- Game Rules -->
      <div class="bg-gray-800 p-4 rounded-lg border border-gray-700 w-full">
        <h4 class="text-sm font-medium text-gray-400 mb-3">Game Rules</h4>
        <div class="space-y-3">
          <div class="flex justify-between items-center">
            <span class="text-gray-300">Rounds</span>
            <span class="px-3 py-1 bg-gray-700 rounded-full text-sm font-medium text-white">
              {{ lobby?.maxRound ?? 0 }}
            </span>
          </div>
          <div class="flex justify-between items-center">
            <span class="text-gray-300">Bid Time</span>
            <span class="px-3 py-1 bg-gray-700 rounded-full text-sm font-medium text-white">
              {{ lobby?.bidTime ?? 0 }}s
            </span>
          </div>
        </div>
      </div>

      <!-- Economy -->
      <div class="bg-gray-800 p-4 rounded-lg border border-gray-700 w-full">
        <h4 class="text-sm font-medium text-gray-400 mb-3">Economy</h4>
        <div class="space-y-3">
          <div class="flex justify-between items-center">
            <span class="text-gray-300">Starting Amount</span>
            <span
              class="px-3 py-1 bg-blue-500 bg-opacity-20 text-white rounded-full text-sm font-medium"
            >
              ${{ lobby?.startAmount ?? 0 }}
            </span>
          </div>
          <div class="flex justify-between items-center">
            <span class="text-gray-300">Max Players</span>
            <span class="px-3 py-1 bg-gray-700 rounded-full text-sm font-medium text-white">
              {{ lobby?.maxPlayers ?? 0 }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
defineProps({
  lobby: {
    type: Object as () => {
      maxPlayers: number
      maxRound: number
      startAmount: number
      bidTime: number
    },
    required: true,
  },
})
</script>
