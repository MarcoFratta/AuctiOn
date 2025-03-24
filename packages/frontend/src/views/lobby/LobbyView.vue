<template>
  <div v-if="lobby" class="min-h-[80vh]">
    <div class="w-full max-w-3xl mx-auto bg-gray-800 p-4 lg:p-8 rounded-lg shadow-lg">
      <!-- Header -->
      <div class="mb-8 text-center">
        <h2 class="text-3xl font-bold text-white mb-2">🎮 Auction Lobby</h2>
      </div>

      <!-- Game Settings -->
      <div class="grid gap-6 mb-8">
        <LobbyConfigs :lobby="lobby!" />

        <!-- Connected Players -->
        <div class="bg-gray-700 p-4 rounded-lg">
          <LobbyPlayers :players="users" @kick="kick" />
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="space-y-4">
        <!-- Primary Actions -->
        <div class="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            v-if="!amIAdmin"
            :class="[
              'px-6 py-3 rounded-lg font-semibold text-white transition-all w-full sm:w-auto',
              ready ? 'bg-green-500 hover:bg-green-600' : 'bg-red-500 hover:bg-red-600',
            ]"
            @click="setReady"
          >
            {{ ready ? '✓ Ready' : 'Not Ready' }}
          </button>

          <button
            v-if="amIAdmin"
            class="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-semibold transition-all w-full sm:w-auto"
            @click="start"
          >
            Start Auction
          </button>

          <button
            class="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-semibold transition-all w-full sm:w-auto"
            @click="leave"
          >
            {{ amIAdmin ? 'Delete Lobby' : 'Leave Lobby' }}
          </button>
        </div>

        <!-- Share Section -->
        <div class="bg-gray-700 p-4 rounded-lg space-y-4">
          <h3 class="text-lg font-semibold text-white text-center">Share Lobby</h3>
          <CopyCard :url="lobbyUrl" />
          <ShareCard :url="lobbyUrl" />
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, watch } from 'vue'
import { useLobbyStore } from '@/stores/lobbyStore.ts'
import { useUserStore } from '@/stores/userStore.ts'
import LobbyPlayers from '@/components/lobby/LobbyPlayers.vue'
import LobbyConfigs from '@/components/lobby/LobbyConfigs.vue'
import ShareCard from '@/components/lobby/ShareCard.vue'
import CopyCard from '@/components/CopyCard.vue'
import { useLobbyService } from '@/composables/useLobbyService.ts'
import { useAlert } from '@/composables/useAlert.ts'
import { useRouter } from 'vue-router'
import { useSocketStore } from '@/stores/socketStore.ts'

const lobbyStore = useLobbyStore()
const router = useRouter()
useSocketStore()
if (lobbyStore.lobby?.startTimestamp) {
  router.push('/play')
}
const userStore = useUserStore()
const lobby = computed(() => lobbyStore.lobby)
const users = computed(() => lobbyStore.users)
const amIAdmin = computed(() => lobby.value?.creatorId === userStore.user?.id)
const lobbyUrl = computed(() => `${window.location.origin}/join/${lobby.value?.id}`)
const ready = computed(
  () => lobbyStore.users?.find((u) => u.id === userStore.user?.id)?.status === 'ready',
)
const lobbyService = useLobbyService()
const alerts = useAlert()
const leave = async () => {
  await lobbyService.leaveLobby()
  router.push('/')
}
const setReady = () => {
  lobbyService.setState(!ready.value ? 'ready' : 'waiting').catch((_e) => {
    alerts.error("Couldn't set ready", 'Please try again')
  })
}

const kick = (id: string) => {
  lobbyService.kickPlayer(id)
}
const start = async () => {
  try {
    // First set the creator as ready if not already
    if (!ready.value) {
      await lobbyService.setState('ready')
    }

    // Then start the match
    await lobbyService.startMatch()
  } catch (_e) {
    alerts.error("Couldn't start match", 'All players must be ready')
  }
}
watch(
  () => lobbyStore.lobby,
  async (lobby) => {
    if (!lobby) {
      await alerts.error('Disconnected', 'Please refresh the page')
      router.push('/')
    }
  },
)
</script>

<style scoped>
/* Smooth transitions */
button {
  transition: all 0.2s ease;
}

button:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

button:active {
  transform: translateY(0);
}
</style>
