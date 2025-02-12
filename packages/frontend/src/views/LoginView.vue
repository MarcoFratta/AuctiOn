<script lang="ts" setup>
import FormEntry from '@/components/FormEntry.vue'
import { useAuth } from '@/composables/useAuth.ts'
import { ref } from 'vue'
import { useAuthStore } from '@/stores/authStore.ts'

const { login } = useAuth()
const email = ref('')
const password = ref('')
const auth = useAuthStore()
const handleForm = async (event: Event) => {
  await login(email.value, password.value)
}
</script>

<template>
  <form
    class="bg-gray-300 p-6 rounded-lg shadow-md w-80 mx-auto flex flex-col gap-4 space-y-4 items-center"
    @submit.prevent="handleForm"
  >
    <h2 class="text-2xl font-semibold text-gray-800 mb-4">Sign in</h2>

    <FormEntry v-model="email" placeHolder="Enter your email" title="Email" />
    <FormEntry
      v-model="password"
      placeHolder="Enter your password"
      title="Password"
      type="password"
    />

    <!-- Submit Button -->
    <button
      :class="{
        'cursor-not-allowed': auth.isAuthenticated,
      }"
      class="w-full py-2 mt-4 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
      type="submit"
    >
      {{ auth.isAuthenticated ? 'Already Logged In' : 'Submit' }}
    </button>

    <p class="text-sm text-gray-600 mt-4">
      Don't have an account?
      <router-link class="text-blue-500 hover:underline" to="/register">Sign up</router-link>
    </p>
  </form>
</template>
