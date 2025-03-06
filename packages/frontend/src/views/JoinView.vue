<script lang="ts" setup>
import FormEntry from '@/components/FormEntry.vue'
import { ref } from 'vue'
import LoadingButton from '@/components/LoadingButton.vue'
import { useErrorsHandler } from '@/composables/useErrorsHandler.ts'
import { useLobbyStore } from '@/stores/lobbyStore.ts'
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
    const res = await lobbyService.joinLobby(lobbyId.value)
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
  <form>
    <FormEntry
      v-model="lobbyId"
      placeHolder="Enter the lobby ID"
      title="Lobby ID"
      type="email"
      @submit="handleJoin"
    />
    <LoadingButton
      :disable="!lobbyId"
      :loading="false"
      class="mt-4"
      text="Join"
      type="submit"
      @click="handleJoin"
    />
  </form>
</template>
