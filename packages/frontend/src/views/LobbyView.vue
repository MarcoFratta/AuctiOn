<template>
  <div class="w-full md:w-1/2 lg:w-1/3 xl:w-1/3 p-6 bg-gray-900 text-white rounded-xl shadow-lg">
    <h2 class="text-2xl font-bold mb-4 text-center">Auction Lobby</h2>

    <!-- Lobby Info -->
    <header class="text-center mb-6">
      <h3 class="text-lg font-semibold">Lobby ID: {{ lobby?.id ?? 'Not in a lobby' }}</h3>
      <p>You are: {{ self?.id?.substring(0, 10) ?? 'Not logged in' }}</p>
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
        @click="ready = !ready"
      >
        {{ ready ? 'Set Not Ready' : 'Set Ready' }}
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
import { useRouter } from 'vue-router'
import { connectToLobby, kickPlayer, leaveLobby } from '@/api/lobbyService.ts'
import { useLobbyStore } from '@/stores/lobbyStore.ts'
import { useUserStore } from '@/stores/userStore.ts'
import LobbyPlayers from '@/components/lobby/LobbyPlayers.vue'
import LobbyConfigs from '@/components/lobby/LobbyConfigs.vue'
import ShareCard from '@/components/lobby/ShareCard.vue'
import { useAlert } from '@/composables/useAlert.ts'
import CopyCard from '@/components/CopyCard.vue'

const router = useRouter()
const lobbyStore = useLobbyStore()
const userStore = useUserStore()
const lobby = computed(() => lobbyStore.lobby)
const users = computed(() => lobbyStore.users)
const self = computed(() => userStore.user)
const amIAdmin = computed(() => lobby.value?.creatorId === self.value.id)
const lobbyUrl = ref(`${window.location.origin}/join/${lobby.value?.id}`)
const ready = ref(false)
const alerts = useAlert()

const leave = () => {
  leaveLobby()
  router.push('/')
}

const kick = (id: string) => {
  kickPlayer(id)
    .then(() => {
      console.log('Kicked player:', id)
    })
    .catch((e) => {
      console.error('Error kicking player:', e)
    })
}

onMounted(() => {
  try {
    const socket = connectToLobby(
      () => console.log('Connected to lobby'),
      (event, msg) => {
        console.log('Message:', JSON.stringify(msg) + ' Event:', event)
        if (event === 'auction') {
          lobbyStore.setLobby(msg.auction)
        } else if (event == 'player-join') {
          console.log('Player joined:', msg.playerId)
          users.value.push({ id: msg.playerId, status: 'not-connected' })
        } else if (event == 'player-connected') {
          const user = users.value.find((user) => user.id === msg.playerId)
          if (user) user.status = 'connected'
        } else if (event == 'player-disconnected') {
          const user = users.value.find((user) => user.id === msg.playerId)
          if (user) user.status = 'not-connected'
        } else if (event == 'player-ready') {
          const user = users.value.find((user) => user.id === msg.playerId)
          if (user) user.ready = true
        } else if (event == 'player-not-ready') {
          const user = users.value.find((user) => user.id === msg.playerId)
          if (user) user.ready = false
        } else if (event == 'player-leave') {
          lobbyStore.removeUser({ id: msg.playerId })
        }
      },
      async () => {
        console.log('Disconnected from lobby')
        await alerts.error('Disconnected from lobby', '')
        router.push('/').then(() => lobbyStore.clearLobby())
      },
      (error: Event) => console.error('Error:', error),
    )
  } catch (e) {
    router.push('/join')
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
