<template>
  <div class="w-full">
    <div class="flex items-center gap-2 mb-2">
      <div class="bg-purple-100 dark:bg-app-fuchsia-500/20 p-1.5 rounded-lg">
        <svg
          class="h-4 w-4 text-purple-500 dark:text-app-fuchsia-300"
          fill="currentColor"
          viewBox="0 0 20 20"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z"
          />
        </svg>
      </div>
      <div class="flex items-center justify-between w-full">
        <h2 class="text-lg font-semibold text-zinc-900 dark:text-white">Connected Players</h2>
        <span
          class="px-2 py-0.5 bg-gray-100 dark:bg-app-fuchsia-500/20 rounded-full text-xs text-gray-800 dark:text-white"
        >
          {{ players.length }} / {{ lobbyStore.lobby?.maxPlayers ?? 0 }}
        </span>
      </div>
    </div>

    <ul v-if="players.length > 0" class="space-y-2 max-h-[30vh] overflow-y-auto scrollbar-hide">
      <li
        v-for="player in players"
        :key="player.id"
        :class="[
          'flex items-center justify-between p-2 rounded-lg transition-all',
          'bg-white dark:bg-neutral-900',
          player.id === userStore.user?.id
            ? 'border-2 border-app-violet-400'
            : 'border border-gray-200 dark:border-gray-700/50 hover:border-gray-300 dark:hover:border-app-violet-500/30',
        ]"
      >
        <!-- Left Side: Player Info -->
        <div class="flex items-center gap-2">
          <!-- Avatar with Connection Status -->
          <div class="relative">
            <div
              class="w-8 h-8 rounded-full bg-gray-200 dark:bg-app-violet-500/30 flex items-center justify-center text-gray-700 dark:text-white font-bold text-sm"
            >
              {{ getInitials(player.username) }}
            </div>
            <span
              :class="[
                'absolute -top-1 -right-1 w-2 h-2 rounded-full border-2',
                'border-white dark:border-gray-800',
                player.connected ? 'bg-green-500' : 'bg-red-500',
              ]"
              :title="player.connected ? 'Online' : 'Offline'"
            ></span>

            <!-- Admin Crown -->
            <span
              v-if="player.id === lobbyStore.lobby?.creatorId"
              class="absolute -top-2 -left-1 text-xs"
              title="Admin"
            >
              👑
            </span>
          </div>

          <!-- Player Name -->
          <div class="flex flex-col">
            <div class="flex items-center gap-1">
              <span class="font-medium text-sm text-gray-900 dark:text-white">
                {{ player.username }}
              </span>
            </div>

            <!-- Admin text for smaller screens -->
            <span
              v-if="player.id === lobbyStore.lobby?.creatorId"
              class="text-xs text-yellow-600 dark:text-yellow-400"
            >
              Admin
            </span>
          </div>
        </div>

        <!-- Right Side: Status & Actions -->
        <div class="flex items-center gap-2">
          <!-- Ready Status - Hide for creator -->
          <span
            v-if="player.id !== lobbyStore.lobby?.creatorId"
            :class="[
              'px-2 py-0.5 text-xs rounded-full font-medium text-center min-w-[70px] flex items-center justify-center',
              player.status === 'ready'
                ? 'bg-green-100 dark:bg-green-500/20 text-green-800 dark:text-green-300 border border-green-300 dark:border-green-500/50'
                : 'bg-gray-100 dark:bg-gray-700/50 text-gray-600 dark:text-gray-400 border border-gray-300 dark:border-gray-600/50',
            ]"
            class="ml-1"
          >
            {{ player.status === 'ready' ? 'Ready' : 'Not Ready' }}
          </span>

          <!-- Kick Button -->
          <button
            v-if="amIAdmin && player.id !== userStore.user?.id"
            class="p-1 text-white bg-red-500 hover:bg-red-600 rounded-lg transition-colors text-xs font-medium"
            @click="kickPlayer(player.id)"
            title="Kick Player"
          >
            Kick
          </button>
        </div>
      </li>
    </ul>

    <p v-else class="text-center py-4 text-gray-500 dark:text-app-violet-200 text-sm">
      Waiting for players to join...
    </p>
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
