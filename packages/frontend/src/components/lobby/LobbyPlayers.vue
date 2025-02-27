<template>
  <div
    class="w-full bg-gray-800 bg-opacity-50 border border-gray-600 shadow-md rounded-lg p-4 text-white backdrop-blur-lg"
  >
    <h2 class="text-lg font-semibold mb-3 text-center">Connected Players</h2>

    <ul v-if="players.length > 0" class="space-y-2">
      <li
        v-for="player in players"
        :key="player.id"
        class="flex justify-between items-center p-3 bg-gray-700 rounded-lg shadow transition-all"
      >
        <!-- Left Side: Player Info -->
        <div class="flex items-center gap-3">
          <!-- Connection Status Icon -->
          <span
            :class="player.status === 'connected' ? 'bg-green-400' : 'bg-red-500'"
            class="w-3 h-3 rounded-full"
          ></span>

          <!-- Crown Icon if the player is the lobby admin -->
          <span v-if="player.id === lobbyStore.lobby.creatorId" class="text-yellow-400 text-lg"
            >👑</span
          >

          <!-- Player Name -->
          <span class="font-medium text-white">{{ player.id.substring(0, 6) }}</span>
        </div>

        <!-- Kick Button (Visible Only If User is Admin & Not Themselves) -->
        <button
          v-if="amIAdmin && player.id !== userStore.user.id"
          class="px-3 py-1 text-sm font-semibold text-white bg-red-500 rounded-md hover:bg-red-600 transition-transform hover:scale-105"
          @click="kickPlayer(player.id)"
        >
          Kick
        </button>
      </li>
    </ul>

    <p v-else class="text-gray-400 text-center">No players connected.</p>
  </div>
</template>

<script lang="ts" setup>
import { computed, defineEmits, defineProps } from 'vue'
import { useUserStore } from '@/stores/userStore.ts'
import { useLobbyStore } from '@/stores/lobbyStore.ts'

const userStore = useUserStore()
const lobbyStore = useLobbyStore()

defineProps({
  players: {
    type: Array as () => { id: string; name: string; status: string; ready: boolean }[],
    required: true,
  },
})

const emits = defineEmits(['kick'])
const amIAdmin = computed(() => lobbyStore.lobby.creatorId === userStore.user.id)

const kickPlayer = (playerId: string) => {
  emits('kick', playerId)
}
</script>

<style scoped>
/* Smooth button hover effect */
button:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(255, 255, 255, 0.15);
}
</style>
