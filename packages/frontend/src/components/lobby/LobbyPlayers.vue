<template>
  <div class="bg-gray-800 w-full max-w-5xl mt-6 p-6 rounded-lg shadow-lg">
    <h2 class="text-lg font-semibold mb-3">👥 Connected Players</h2>

    <ul v-if="players.length > 0" class="grid gap-3">
      <li
        v-for="player in players"
        :key="player.id"
        class="flex items-center justify-between p-3 bg-gray-700 rounded-md"
      >
        <!-- Left Side: Player Info -->
        <div class="flex items-center">
          <!-- Connection Status Dot -->
          <span
            :class="player.connected ? 'bg-green-400' : 'bg-red-500'"
            class="w-3 h-3 rounded-full mr-3"
          ></span>

          <!-- Player Name with Crown if Admin -->
          <div class="flex items-center">
            <span v-if="player.id === lobbyStore.lobby?.creatorId" class="text-yellow-400 mr-2"
              >👑</span
            >
            <span class="text-white">{{ player.username }}</span>

            <!-- "You" Tag -->
            <span
              v-if="player.id === userStore.user?.id"
              class="ml-2 px-2 py-0.5 bg-gray-600 text-yellow-400 text-xs rounded-full"
            >
              You
            </span>
          </div>
        </div>

        <!-- Right Side: Player Status & Actions -->
        <div class="flex items-center space-x-3">
          <!-- Ready Status Badge -->
          <span
            :class="
              player.status === 'ready'
                ? 'bg-green-500 bg-opacity-20 text-white'
                : 'bg-gray-600 text-gray-400'
            "
            class="px-2 py-0.5 text-xs rounded-full"
          >
            {{ player.status === 'ready' ? 'Ready' : 'Not Ready' }}
          </span>

          <!-- Kick Button (Only If Admin & Not Themselves) -->
          <button
            v-if="amIAdmin && player.id !== userStore.user?.id"
            class="px-3 py-1 text-xs font-medium text-white bg-red-500 hover:bg-red-600 rounded-md transition-all"
            @click="kickPlayer(player.id)"
          >
            Kick
          </button>
        </div>
      </li>
    </ul>

    <p v-else class="text-gray-400 text-center py-3">No players connected.</p>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { useUserStore } from '@/stores/userStore'
import { type Player, useLobbyStore } from '@/stores/lobbyStore'

const userStore = useUserStore()
const lobbyStore = useLobbyStore()

defineProps({
  players: {
    type: Array as () => Player[],
    required: true,
  },
})

const emits = defineEmits(['kick'])
const amIAdmin = computed(() => lobbyStore.lobby?.creatorId === userStore.user?.id)

const kickPlayer = (playerId: string) => {
  emits('kick', playerId)
}
</script>
