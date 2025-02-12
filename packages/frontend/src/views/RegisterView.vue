<script lang="ts" setup>
import { computed, ref } from 'vue'
import { useAuth } from '../composables/useAuth.ts'
import FormEntry from '../components/FormEntry.vue'
import { useAuthStore } from '@/stores/authStore.ts'

const { register } = useAuth()

const name = ref('')
const email = ref('')
const password = ref('')
const isAuthenticated = computed(() => useAuthStore().isAuthenticated)
const handleForm = async (event: Event) => {
  await register(name.value, email.value, password.value)
}
</script>

<template>
  <form
    class="bg-gray-300 p-6 rounded-lg shadow-md w-80 mx-auto flex flex-col gap-4 space-y-4 items-center"
    @submit.prevent="handleForm"
  >
    <h2 class="text-2xl font-semibold text-gray-800 mb-4">Register</h2>

    <!-- Email Input -->
    <FormEntry v-model="name" placeHolder="Enter your name" title="Name" />
    <FormEntry v-model="email" placeHolder="Enter your email" title="Email" />
    <FormEntry v-model="password" placeHolder="Enter your password" title="Password" />
    <FormEntry placeHolder="Confirm your password" title="Confirm Password" />

    <!-- Submit Button -->
    <button
      :class="{
        'cursor-not-allowed': isAuthenticated,
      }"
      class="w-full py-2 mt-4 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
      type="submit"
    >
      {{ isAuthenticated ? 'Already Logged In' : 'Submit' }}
    </button>

    <p class="text-sm text-gray-600 mt-4">
      Already have an account?
      <router-link class="text-blue-500 hover:underline" to="/login">Sign in</router-link>
    </p>
  </form>
</template>
