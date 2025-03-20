<template>
  <div class="w-full">
    <div class="flex items-center justify-between mb-4">
      <h2 class="text-lg font-semibold text-white">👥 Connected Players</h2>
      <span class="px-3 py-1 bg-gray-800 rounded-full text-sm text-gray-300">
        {{ players.length }} / {{ lobbyStore.lobby?.maxPlayers ?? 0 }}
      </span>
    </div>

    <ul v-if="players.length > 0" class="space-y-3">
      <li
        v-for="player in players"
        :key="player.id"
        :class="[
          'flex items-center justify-between p-4 rounded-lg transition-all bg-gray-800',
          player.id === userStore.user?.id
            ? 'border-2 border-blue-500'
            : 'border border-gray-700 hover:border-gray-600',
        ]"
      >
        <!-- Left Side: Player Info -->
        <div class="flex items-center gap-3">
          <!-- Avatar with Connection Status -->
          <div class="relative">
            <div
              class="w-10 h-10 rounded-full bg-gray-600 flex items-center justify-center text-white font-bold text-lg"
            >
              {{ getInitials(player.username) }}
            </div>
            <span
              :class="[
                'absolute -top-1 -right-1 w-3 h-3 rounded-full border-2 border-gray-800',
                player.connected ? 'bg-green-500' : 'bg-red-500',
              ]"
              :title="player.connected ? 'Online' : 'Offline'"
            ></span>

            <!-- Admin Crown -->
            <span
              v-if="player.id === lobbyStore.lobby?.creatorId"
              class="absolute -top-2 -left-1 text-sm"
              title="Admin"
            >
              👑
            </span>
          </div>

          <!-- Player Name -->
          <div class="flex flex-col">
            <div class="flex items-center gap-2">
              <span class="font-medium text-white">
                {{ player.username }}
              </span>
            </div>

            <!-- Admin text for smaller screens -->
            <span v-if="player.id === lobbyStore.lobby?.creatorId" class="text-xs text-yellow-400">
              Admin
            </span>
          </div>
        </div>

        <!-- Right Side: Status & Actions -->
        <div v-if="player.id != lobbyStore.lobby?.creatorId" class="flex items-center gap-3">
          <!-- Ready Status -->
          <span
            :class="[
              'px-3 py-1 text-sm rounded-full font-medium text-center min-w-[90px] flex items-center justify-center',
              player.status === 'ready'
                ? 'bg-green-500 bg-opacity-20 text-white border border-green-500'
                : 'bg-gray-700 text-gray-400 border border-gray-600',
            ]"
            class="ml-1"
          >
            {{ player.status === 'ready' ? 'Ready' : 'Not Ready' }}
          </span>

          <!-- Kick Button -->
          <button
            v-if="amIAdmin"
            class="p-1.5 text-white bg-red-500 hover:bg-red-600 rounded-lg transition-colors text-xs font-medium"
            @click="kickPlayer(player.id)"
            title="Kick Player"
          >
            Kick
          </button>
        </div>
      </li>
    </ul>

    <p v-else class="text-center py-6 text-gray-400">Waiting for players to join...</p>
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

// Function to get the first letter of username
const getInitials = (username: string): string => {
  if (!username) return '?'
  return username.substring(0, 1).toUpperCase()
}
</script>
