<template>
  <div class="w-full">
    <div class="flex items-center justify-between mb-4">
      <h2 class="text-lg font-semibold text-white">👥 Connected Players</h2>
      <span class="px-3 py-1 bg-gray-800 rounded-full text-sm text-gray-300">
        {{ players.length }} / {{ lobbyStore.lobby?.maxPlayers ?? 0 }}
      </span>
    </div>

    <ul v-if="players.length > 0" class="space-y-2">
      <li
        v-for="player in players"
        :key="player.id"
        class="flex items-center justify-between p-3 bg-gray-800 rounded-lg border border-gray-700 transition-all hover:border-gray-600"
      >
        <!-- Left Side: Player Info -->
        <div class="flex items-center gap-3">
          <!-- Connection Status -->
          <div class="relative">
            <span
              :class="player.connected ? 'bg-green-500' : 'bg-red-500'"
              class="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full"
            ></span>
            <span class="text-xl">👤</span>
          </div>

          <!-- Player Name and Badges -->
          <div class="flex items-center gap-2">
            <span class="text-gray-200">{{ player.username }}</span>

            <!-- Admin Crown -->
            <TagCard
              v-if="player.id === lobbyStore.lobby?.creatorId"
              class="px-2 py-0.5 bg-yellow-600 text-xs"
              text="Admin"
            />
            <!-- "You" Badge -->
            <TagCard
              v-if="player.id === userStore.user?.id"
              class="bg-blue-500 text-white text-xs"
              text="You"
            />
          </div>
        </div>

        <!-- Right Side: Status & Actions -->
        <div class="flex items-center gap-3">
          <!-- Ready Status -->
          <span
            :class="[
              'px-3 py-1 text-sm rounded-full transition-colors',
              player.status === 'ready'
                ? 'bg-green-500 bg-opacity-20 text-white'
                : 'bg-gray-700 text-gray-400',
            ]"
          >
            {{ player.status === 'ready' ? 'Ready' : 'Not Ready' }}
          </span>

          <!-- Kick Button -->
          <button
            v-if="amIAdmin && player.id !== userStore.user?.id"
            class="p-2 text-white hover:bg-red-500 hover:bg-opacity-20 px-8 bg-red-400 text-xs rounded-lg transition-colors"
            @click="kickPlayer(player.id)"
            title="Kick Player"
          >
            kick
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
import TagCard from '@/components/TagCard.vue'

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
