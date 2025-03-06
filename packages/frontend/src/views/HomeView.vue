<template>
  <div
    class="min-h-screen w-full flex flex-col items-center justify-center bg-gray-100 text-gray-900 p-6"
  >
    <h1 class="text-4xl font-bold mb-6">AuctiOn</h1>

    <div class="flex space-x-4">
      <LoadingButton v-if="authenticated" text="Go to Lobby" type="submit" @click="goToLobby" />
      <LoadingButton v-if="authenticated" text="Join Lobby" @click="joinLobby" />
      <LoadingButton v-if="authenticated" text="Create Lobby" @click="createLobby" />
      <LoadingButton v-if="!authenticated" text="Login" @click="router.push('/login')" />
      <LoadingButton v-if="!authenticated" text="Register" @click="router.push('/register')" />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import LoadingButton from '@/components/LoadingButton.vue'
import { useAuth } from '@/composables/useAuth.js'
import { useAuthStore } from '@/stores/authStore.js'
import { useLobbyService } from '@/composables/useLobbyService.ts'

const router = useRouter()

const lobbyId = ref('')

const goToLobby = () => router.push('/lobby')
const createLobby = () => router.push('/create')
const joinLobby = () => router.push(`/join`)
const lobbyService = useLobbyService()
const authStore = useAuthStore()
const authenticated = computed(() => authStore.isAuthenticated)

onMounted(() => {
  if (!authenticated.value) {
    useAuth()
      .refresh()
      .then(() => {
        console.log('Authenticated')
      })
      .then(() => {})
      .catch((e) => {
        console.error(e)
      })
  }
})
</script>
