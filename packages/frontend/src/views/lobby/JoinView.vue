<script lang="ts" setup>
import FormEntry from '@/components/FormEntry.vue'
import { ref } from 'vue'
import LoadingButton from '@/components/LoadingButton.vue'
import { useErrorsHandler } from '@/composables/useErrorsHandler.ts'
import { type Lobby, useLobbyStore } from '@/stores/lobbyStore.ts'
import { useRouter } from 'vue-router'
import { useLobbyService } from '@/composables/useLobbyService.ts'

const lobbyStore = useLobbyStore()
const errorsHandler = useErrorsHandler()
const lobbyId = ref('')
const router = useRouter()
const lobbyService = useLobbyService()
const handleJoin = async (event: Event) => {
  try {
    console.log('Joining lobby with ID:', lobbyId.value)
    const res = (await lobbyService.joinLobby(lobbyId.value)) as Lobby
    lobbyStore.setLobby(res)
    router.push('/lobby')
  } catch (e) {
    console.error(e)
    const err = errorsHandler
      .create(e)
      .alreadyInLobby()
      .authenticationError()
      .tooManyRequests()
      .notFound('Lobby not found')
      .get()
    errorsHandler.show(err)
  }
}
</script>

<template>
  <div class="min-h-[80vh] flex items-center justify-center p-4">
    <div class="bg-gray-800 p-6 lg:p-8 rounded-lg shadow-lg w-full max-w-md">
      <!-- Header -->
      <div class="mb-6">
        <h2 class="text-2xl font-bold text-white">🔍 Join Lobby</h2>
        <p class="text-gray-300 mt-2">Enter a lobby ID to join an existing game.</p>
      </div>

      <!-- Form -->
      <div class="bg-gray-700 p-4 rounded-lg space-y-4">
        <div class="space-y-2">
          <label class="block text-sm font-medium text-gray-200" for="lobbyId">Lobby ID</label>
          <FormEntry
            id="lobbyId"
            v-model="lobbyId"
            class="w-full"
            placeHolder="Enter the lobby ID"
            @submit="handleJoin"
          />
        </div>
      </div>

      <!-- Action Button -->
      <div class="mt-6">
        <LoadingButton
          :class="
            lobbyId ? 'bg-green-500 hover:bg-green-600 text-white' : 'bg-gray-600 text-gray-400'
          "
          :disable="!lobbyId"
          :loading="false"
          class="w-full py-3 px-4 rounded-md font-semibold text-lg transition-all"
          text="Join Lobby"
          @click="handleJoin"
        />
      </div>
    </div>
  </div>
</template>
