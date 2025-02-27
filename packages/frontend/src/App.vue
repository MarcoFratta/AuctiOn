<script lang="ts" setup>
import { computed, ref } from 'vue'
import { useAuthStore } from '@/stores/authStore.ts'
import { useAuth } from '@/composables/useAuth.ts'
import { useLobbyStore } from '@/stores/lobbyStore.ts'

const authStore = useAuthStore()
const lobbyStore = useLobbyStore()
const auth = useAuth()
const errors = ref()
auth.refresh()

const notAuthenticated = computed(() => {
  return !authStore.isAuthenticated
})
</script>

<template>
  <header>
    <nav class="bg-gray-900 text-white p-4">
      <div class="container mx-auto flex justify-between items-center">
        <RouterLink class="text-2xl font-bold" to="/">Auction</RouterLink>
        <div>
          <RouterLink v-if="notAuthenticated" class="mx-2" to="/login">Login</RouterLink>
          <RouterLink v-if="notAuthenticated" class="mx-2" to="/register">Register</RouterLink>
          <RouterLink class="mx-2" to="/">Home</RouterLink>
        </div>
      </div>
    </nav>
  </header>
  <section id="error">
    <p v-if="errors">{{ errors }}</p>
  </section>
  <section class="flex center items-center justify-center mt-4 w-full h-full">
    <RouterView></RouterView>
  </section>
</template>
