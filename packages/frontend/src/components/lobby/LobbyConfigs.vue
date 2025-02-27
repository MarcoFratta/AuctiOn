<template>
  <!-- Lobby Settings Card -->
  <div
    class="mb-6 p-6 rounded-2xl shadow-md bg-gray-800 bg-opacity-50 border border-gray-600 backdrop-blur-lg w-full"
  >
    <h3 class="text-2xl font-semibold text-white mb-4">Lobby Settings</h3>

    <div class="space-y-3 text-gray-300">
      <div class="flex justify-between border-b border-gray-600 pb-2">
        <span>Max Players</span>
        <span class="font-medium text-white">{{ lobby?.maxPlayers ?? 0 }}</span>
      </div>

      <div class="flex justify-between border-b border-gray-600 pb-2">
        <span>Max Rounds</span>
        <span class="font-medium text-white">{{ lobby?.maxRound ?? 0 }}</span>
      </div>

      <div class="flex justify-between border-b border-gray-600 pb-2">
        <span>Starting Amount</span>
        <span class="font-medium text-white">${{ lobby?.startAmount ?? 0 }}</span>
      </div>

      <div class="flex justify-between">
        <span>Bid Time</span>
        <span class="font-medium text-white">{{ lobby?.bidTime ?? 0 }} seconds</span>
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

<style scoped></style>
