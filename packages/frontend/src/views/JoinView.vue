<script lang="ts" setup>
import FormEntry from '@/components/FormEntry.vue'
import { ref } from 'vue'
import LoadingButton from '@/components/LoadingButton.vue'
import { joinLobby } from '@/api/lobbyService.ts'
import { useAlert } from '@/composables/useAlert.ts'
import { useErrorsHandler } from '@/composables/useErrorsHandler.ts'

const alerts = useAlert()
const errorsHandler = useErrorsHandler()
const lobbyId = ref('')
const handleJoin = async (event: Event) => {
  try {
    console.log('Joining lobby with ID:', lobbyId.value)
    const res = await joinLobby(lobbyId.value)
    alerts.success('Lobby joined', 'You have successfully joined the lobby')
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
