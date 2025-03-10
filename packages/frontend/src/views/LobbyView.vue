<template>
  <div
    v-if="lobby"
    class="w-full md:w-1/2 lg:w-1/3 xl:w-1/3 p-6 bg-gray-900 text-white rounded-xl shadow-lg"
  >
    <h2 class="text-2xl font-bold mb-4 text-center">Auction Lobby</h2>

    <!-- Lobby Info -->
    <header class="text-center mb-6">
      <h3 class="text-lg font-semibold">Lobby ID: {{ lobby?.id ?? 'Not in a lobby' }}</h3>
      <p>You are: {{ self?.username ?? 'Not logged in' }}</p>
      <p v-if="amIAdmin" class="text-sm text-gray-400 mt-2">You are the admin</p>
    </header>

    <LobbyConfigs :lobby="lobby" />

    <!-- Connected Players -->
    <section class="mb-6">
      <LobbyPlayers :players="users" @kick="kick" />
    </section>

    <!-- Player Actions -->
    <section class="flex flex-col sm:flex-row justify-center items-center gap-3">
      <button
        :class="ready ? 'bg-green-500 hover:bg-green-600' : 'bg-red-500 hover:bg-red-600'"
        class="px-4 py-2 rounded-lg text-white font-semibold w-full sm:w-auto"
        @click="setReady"
      >
        {{ ready ? 'Set Not Ready' : 'Set Ready' }}
      </button>
      <button
        v-if="amIAdmin"
        class="px-4 py-2 bg-gray-700 rounded-lg text-white font-semibold w-full sm:w-auto"
        @click="start"
      >
        Start Auction
      </button>

      <button
        class="px-4 py-2 bg-gray-700 hover:bg-gray-800 text-white rounded-lg w-full sm:w-auto"
        @click="leave"
      >
        {{ amIAdmin ? 'Delete Lobby' : 'Leave Lobby' }}
      </button>
    </section>

    <!-- Share Lobby -->
    <footer class="mt-6 p-4 bg-gray-800 text-white rounded-lg shadow-md text-center">
      <p class="text-lg font-semibold mb-2">Share Lobby</p>
      <CopyCard :url="lobbyUrl" />

      <ShareCard :url="lobbyUrl" class="mt-4" />
    </footer>
  </div>
</template>

<script lang="ts" setup>
import { computed, onMounted, ref } from 'vue'
import { useLobbyStore } from '@/stores/lobbyStore.ts'
import { useUserStore } from '@/stores/userStore.ts'
import LobbyPlayers from '@/components/lobby/LobbyPlayers.vue'
import LobbyConfigs from '@/components/lobby/LobbyConfigs.vue'
import ShareCard from '@/components/lobby/ShareCard.vue'
import CopyCard from '@/components/CopyCard.vue'
import { useLobbyService } from '@/composables/useLobbyService.ts'
import { useAlert } from '@/composables/useAlert.ts'
import { useLobbyMsgHandler } from '@/composables/useLobbyMsgHandler.ts'
import { useRouter } from 'vue-router'

const lobbyStore = useLobbyStore()
const userStore = useUserStore()
const lobby = computed(() => lobbyStore.lobby)
const users = computed(() => lobbyStore.users)
const self = computed(() => userStore.user)
const amIAdmin = computed(() => lobby.value?.creatorId === userStore.user?.id)
const lobbyUrl = ref(`${window.location.origin}/join/${lobby.value?.id}`)
const ready = computed(
  () => lobbyStore.users?.find((u) => u.id === userStore.user?.id)?.status === 'ready',
)
const router = useRouter()
const lobbyService = useLobbyService()
const alerts = useAlert()
const leave = () => {
  lobbyService.leaveLobby()
}
const setReady = () => {
  lobbyService.setState(!ready.value ? 'ready' : 'waiting').catch((_e) => {
    alerts.error("Couldn't set ready", 'Please try again')
  })
}

const kick = (id: string) => {
  lobbyService.kickPlayer(id)
}
const start = () => {
  lobbyService.startMatch().catch((_e) => {
    alerts.error("Couldn't start match", 'All players must be ready')
  })
}

onMounted(() => {
  if (lobbyStore.lobby?.startTimestamp) {
    router.push('/play')
  } else {
    useLobbyMsgHandler().connectAndHandle()
  }
})
</script>

<style scoped>
/* Smooth button hover effect */
button:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(255, 255, 255, 0.15);
}

/* Input styling for mobile */
input {
  font-size: 1rem;
}
</style>
