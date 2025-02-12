<script lang="ts" setup>
import { computed } from 'vue'
import { useAuthStore } from '@/stores/authStore.ts'
import { useAuth } from '@/composables/useAuth.ts'

const authStore = useAuthStore()
const auth = useAuth()
auth.refresh()
const notAuthenticated = computed(() => {
  return !authStore.isAuthenticated
})
</script>

<template>
  <header>
    <nav class="bg-gray-600 text-white p-4">
      <div class="container mx-auto flex justify-between items-center">
        <router-link class="text-2xl font-bold" to="/">Auction</router-link>
        <div>
          <router-link v-if="notAuthenticated" class="mx-2" to="/login">Login</router-link>
          <router-link v-if="notAuthenticated" class="mx-2" to="/register">Register</router-link>
          <router-link class="mx-2" to="/">Home</router-link>
        </div>
      </div>
    </nav>
  </header>
  <section class="flex center items-center justify-center h-screen">
    <RouterView></RouterView>
  </section>
</template>
