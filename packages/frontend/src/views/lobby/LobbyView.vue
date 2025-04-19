<template>
  <Background>
    <!-- Loading State when lobby is not defined -->
    <LobbyLoading v-if="!lobbyStore.lobby || !userStore.user" />

    <!-- Existing lobby content -->
    <div v-else class="w-full h-fit flex flex-col justify-center items-center mt-2">
      <!-- Replace the header with our new component -->
      <PageHeader
        subtitle="Get ready for the auction! Invite friends and start when everyone is ready."
        title="Auction Lobby"
      />

      <!-- Main Content - Reorganized for better space utilization -->
      <div class="w-full grid grid-cols-1 lg:grid-cols-3 gap-3 md:gap-4 max-w-5xl">
        <!-- Left Column: Game Settings & Players -->
        <div class="lg:col-span-2">
          <BaseCard class="h-full">
            <div class="grid gap-4">
              <!-- Game Settings -->
              <LobbyConfigs :lobby="lobbyStore.lobby!" />

              <!-- Connected Players -->
              <LobbyPlayers :players="users" @kick="kick" />
            </div>
          </BaseCard>
        </div>

        <!-- Right Column: Actions & Sharing -->
        <div class="lg:col-span-1">
          <BaseCard class="h-full">
            <!-- Action Buttons -->
            <div class="space-y-3 mb-4">
              <!-- Primary Actions -->
              <div class="flex flex-col sm:flex-row lg:flex-col gap-2 justify-center">
                <button
                  v-if="!amIAdmin"
                  :class="[
                    'px-4 py-2 rounded-lg font-semibold text-white transition-all w-full',
                    !ready
                      ? 'bg-green-500 hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700'
                      : 'bg-red-500 hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700',
                  ]"
                  @click="setReady"
                >
                  {{ ready ? 'Set Not Ready' : 'Set Ready' }}
                </button>

                <LoadingButton v-if="amIAdmin" class="w-full" @click="start">
                  Start Auction
                </LoadingButton>

                <LoadingButton
                  btnStyle="bg-gray-200 hover:bg-gray-300 dark:bg-gray-700
                  shadow-none dark:hover:bg-gray-600  rounded-lg
                  font-semibold transition-all w-full"
                  confirm-button-text="Delete"
                  confirm-message="Are you sure you want to delete this lobby? This action cannot be undone."
                  confirm-title="Delete lobby"
                  require-confirm
                  @click="leave"
                >
                  <p class="text-neutral-600 dark:text-white">
                    {{ amIAdmin ? 'Delete Lobby' : 'Leave Lobby' }}
                  </p>
                </LoadingButton>
              </div>
            </div>

            <!-- Share Section -->
            <div>
              <h3 class="text-lg font-semibold text-gray-800 dark:text-white text-center mb-3">
                Invite Players
              </h3>
              <InnerCard class="mb-3">
                <CopyCard :url="lobbyUrl" />
              </InnerCard>
              <ShareCard :url="lobbyUrl" />
            </div>
          </BaseCard>
        </div>
      </div>
    </div>
  </Background>
</template>

<script lang="ts" setup>
import { computed, watch } from 'vue'
import { useLobbyStore } from '@/stores/lobbyStore.ts'
import { useUserStore } from '@/stores/userStore.ts'
import LobbyPlayers from '@/components/lobby/LobbyPlayers.vue'
import LobbyConfigs from '@/components/lobby/LobbyConfigs.vue'
import ShareCard from '@/components/lobby/ShareCard.vue'
import CopyCard from '@/components/common/CopyCard.vue'
import { useLobbyService } from '@/composables/useLobbyService.ts'
import { useAlert } from '@/composables/useAlert.ts'
import { useRouter } from 'vue-router'
import Background from '@/components/common/Background.vue'
import BaseCard from '@/components/common/BaseCard.vue'
import LoadingButton from '@/components/common/LoadingButton.vue'
import InnerCard from '@/components/common/InnerCard.vue'
import { useErrorsHandler } from '@/composables/useErrorsHandler.ts'
import LobbyLoading from '@/components/lobby/LobbyLoading.vue'
import { useAuctionConnection } from '@/composables/useAuctionConnection.ts'
import PageHeader from '@/components/common/PageHeader.vue'

const lobbyStore = useLobbyStore()
const router = useRouter()
const userStore = useUserStore()
const users = computed(() => lobbyStore.users)
const amIAdmin = computed(() => {
  if (!lobbyStore.lobby || !userStore.user) return false
  return lobbyStore.lobby?.creatorId === userStore.user?.id
})
const lobbyUrl = computed(() => {
  if (!lobbyStore.lobby) return ''
  return `${window.location.origin}/join/${lobbyStore.lobby?.id}`
})
const ready = computed(() => {
  if (!lobbyStore.lobby || !userStore.user) return false
  return lobbyStore.users.find((u) => u.id === userStore.user!.id)?.status === 'ready'
})
const lobbyService = useLobbyService()
const alerts = useAlert()

const leave = async () => {
  await lobbyService.leaveLobby()
  router.push('/')
}

const setReady = () => {
  lobbyService.setState(!ready.value ? 'ready' : 'waiting').catch(() => {
    alerts.error("Couldn't set ready", 'Please try again')
  })
}

const kick = (id: string) => {
  lobbyService.kickPlayer(id)
}
const errorsHandler = useErrorsHandler()
const start = async () => {
  try {
    // First set the creator as ready if not already
    if (!ready.value) {
      await lobbyService.setState('ready')
    }

    // Then start the match
    await lobbyService.startMatch()
  } catch (e) {
    const err = errorsHandler
      .create(e)
      .unknownError()
      .invalidData(
        "Couldn't start match",
        users.value.length > 1 ? 'All players must be ready' : 'You need at least 2 players',
      )
      .tooManyRequests()
      .get()
    await errorsHandler.show(err)
  }
}
if (!lobbyStore.lobby) {
  useAuctionConnection()
    .connect()
    .catch(() => {
      alerts.error('Not found', 'You have not joined any lobby, please try again later')
      router.push('/')
    })
}
if (lobbyStore.lobby?.startTimestamp) {
  router.push('/play')
}
watch(
  () => lobbyStore.lobby,
  async (lobby) => {
    if (!lobby) {
      await alerts.error('Disconnected', 'You have been disconnected from the lobby')
      router.push('/')
    } else if (lobbyStore.lobby?.startTimestamp) {
      router.push('/play')
    }
  },
  { deep: true },
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
