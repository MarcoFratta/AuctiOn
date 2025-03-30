<script lang="ts" setup>
import { useRoute, useRouter } from 'vue-router'
import { onMounted } from 'vue'
import { useLobbyService } from '@/composables/useLobbyService.ts'
import { useErrorsHandler } from '@/composables/useErrorsHandler.ts'
import { useAuctionConnection } from '@/composables/useAuctionConnection.ts'

const route = useRoute()
const router = useRouter()
const errorsHandler = useErrorsHandler()
const lobbyService = useLobbyService()
onMounted(() => {
  const lobbyId = route.params.lobbyId as string
  lobbyService
    .joinLobby(lobbyId)
    .then(() => {
      useAuctionConnection()
        .connect()
        .then(() => router.push(`/lobby`))
    })
    .catch((e) => {
      console.log('Joining lobby error', e)
      const err = errorsHandler
        .create(e)
        .alreadyInLobby('You already joined a lobby', () => router.push('/lobby'))
        .authenticationError(undefined, () => {
          console.log('Joining lobby error', err)
          router.push(`/login?redirect=${route.fullPath}`)
        })
        .invalidData('Lobby not found', 'Please try again', () => {
          router.push('/')
        })
        .tooManyRequests()
        .notFound('Lobby not found', 'Please try again', () => router.push(`/`))
      errorsHandler.showAndRun(err)
    })
})
</script>

<template></template>
