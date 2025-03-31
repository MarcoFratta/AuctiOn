<script lang="ts" setup>
import FormEntry from '@/components/FormEntry.vue'
import { ref } from 'vue'
import LoadingButton from '@/components/LoadingButton.vue'
import { useErrorsHandler } from '@/composables/useErrorsHandler.ts'
import { useLobbyStore } from '@/stores/lobbyStore.ts'
import { useRouter } from 'vue-router'
import { useLobbyService } from '@/composables/useLobbyService.ts'
import Background from '@/components/Background.vue'
import Title from '@/components/Title.vue'
import { useAuctionConnection } from '@/composables/useAuctionConnection.ts'
import BaseCard from '@/components/BaseCard.vue'

const lobbyStore = useLobbyStore()
const errorsHandler = useErrorsHandler()
const lobbyId = ref('')
const router = useRouter()
const lobbyService = useLobbyService()
const isLoading = ref(false)

const handleJoin = async () => {
  if (!lobbyId.value) return

  try {
    isLoading.value = true
    console.log('Joining lobby with ID:', lobbyId.value)
    await lobbyService.joinLobby(lobbyId.value)
    await useAuctionConnection()
      .connect()
      .then(() => router.push('/lobby'))
  } catch (e) {
    console.error(e)
    const err = errorsHandler
      .create(e)
      .unknownError()
      .invalidData('Lobby not found', 'Please try again')
      .alreadyInLobby()
      .authenticationError()
      .tooManyRequests()
      .notFound('Lobby not found', 'Please try again')
      .get()
    errorsHandler.show(err)
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <Background>
    <div class="flex flex-col items-center justify-center px-4">
      <!-- Header -->
      <div class="text-center mb-8">
        <Title class="text-4xl mb-4">Join Lobby</Title>
        <span class="dark:text-app-violet-200 text-gray-600 text-xl block">
          Enter a lobby ID to join an existing game
        </span>
      </div>

      <div class="w-full max-w-md">
        <!-- Form Fields -->
        <BaseCard class="mb-6">
          <div class="space-y-2">
            <FormEntry
              id="lobbyId"
              v-model="lobbyId"
              class="w-full"
              placeHolder="Enter the lobby ID"
              title="Lobby ID"
              @keyup.enter="handleJoin"
            />
          </div>
        </BaseCard>

        <!-- Action Section -->
        <div class="flex flex-col gap-4">
          <LoadingButton
            :disable="!lobbyId"
            :loading="isLoading"
            class="w-full py-3"
            text="Join Lobby"
            @click="handleJoin"
          />
          <div class="flex flex-col sm:flex-row justify-center items-center center">
            <p class="text-center dark:text-app-violet-200 text-gray-600">
              Want to create your own game?
            </p>
            <router-link
              class="sm:ml-2 dark:text-app-fuchsia-600 dark:hover:text-app-fuchsia-500 text-indigo-600 hover:text-indigo-500 font-medium"
              to="/create"
            >
              Create Lobby
            </router-link>
          </div>
        </div>
      </div>
    </div>
  </Background>
</template>

<style scoped>
/* Gradient text effect for title */
.bg-gradient-to-r {
  background-size: 200% 200%;
  animation: gradient-shift 8s ease infinite;
}

@keyframes gradient-shift {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}
</style>
