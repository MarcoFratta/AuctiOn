<script lang="ts" setup>
import FormEntry from '@/components/FormEntry.vue'
import { useAuth } from '@/composables/useAuth.ts'
import { useAuthStore } from '@/stores/authStore.ts'
import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import { signInSchema } from '@/schemas/authSchema.ts'
import { computed, ref } from 'vue'
import router from '@/router'
import { useAlert } from '@/composables/useAlert.ts'
import LoadingButton from '@/components/LoadingButton.vue'
import { useErrorsHandler } from '@/composables/useErrorsHandler.ts'

const { login } = useAuth()
const schema = toTypedSchema(signInSchema)
const { values, errors, defineField } = useForm({
  validationSchema: schema,
})

const [email, emailProps] = defineField('email', {
  props: (state) => ({
    error: state.errors[0],
  }),
})
const [password, passwordProps] = defineField('password', {
  props: (state) => ({
    error: state.errors[0],
  }),
})
const auth = useAuthStore()
useAlert()
const errorHandler = useErrorsHandler()
const waitingResponse = ref(false)
const isAuthenticated = computed(() => auth.isAuthenticated)
const canSubmit = computed(
  () =>
    !(
      isAuthenticated.value ||
      !values.email ||
      !values.password ||
      errors.value.email ||
      errors.value.password
    ) && !waitingResponse.value,
)
const redirectTo = (
  typeof router.currentRoute.value.query.redirect === 'string'
    ? router.currentRoute.value.query.redirect
    : '/'
) as string
const handleForm = async (event: Event) => {
  try {
    console.log('canSubmit', canSubmit.value)
    if (!canSubmit.value) throw new Error('Invalid form')
    waitingResponse.value = true
    await login(values.email!, values.password!)
    router.push(redirectTo)
  } catch (e) {
    const err = errorHandler
      .create(e)
      .unknownError()
      .notFound('Account not found', 'Please sign up', () =>
        router.push(`/register?redirect=${redirectTo}`),
      )
      .invalidData('Incorrect password', 'Please try again')
      .tooManyRequests()
    await errorHandler.showAndRun(err)
  } finally {
    waitingResponse.value = false
  }
}
</script>

<template>
  <div class="min-h-screen bg-gray-900 flex items-center justify-center p-4">
    <form
      class="bg-gray-800 p-6 lg:p-8 rounded-lg shadow-lg w-full max-w-md flex flex-col gap-4"
      @submit.prevent="handleForm"
    >
      <!-- Header -->
      <div class="mb-6">
        <h2 class="text-2xl font-bold text-white">🔐 Sign In</h2>
        <p class="text-gray-400 mt-2">Welcome back! Please enter your details.</p>
      </div>

      <!-- Form Fields -->
      <div class="bg-gray-700 p-4 rounded-lg space-y-4">
        <div class="space-y-1">
          <label class="block text-sm font-medium text-gray-300" for="email">Email</label>
          <FormEntry
            id="email"
            v-model="email"
            autocomplete="email"
            placeHolder="Enter your email"
            type="email"
            v-bind="emailProps"
          />
        </div>
        <div class="space-y-1">
          <label class="block text-sm font-medium text-gray-300" for="password">Password</label>
          <FormEntry
            id="password"
            v-model="password"
            autocomplete="current-password"
            placeHolder="Enter your password"
            type="password"
            v-bind="passwordProps"
          />
        </div>
      </div>

      <!-- Action Section -->
      <div class="flex flex-col gap-2">
        <LoadingButton
          :class="
            canSubmit ? 'bg-blue-500 hover:bg-blue-600 text-white' : 'bg-gray-600 text-gray-400'
          "
          :disable="!canSubmit"
          :loading="waitingResponse"
          :text="auth.isAuthenticated ? 'Already Logged In' : 'Sign In'"
          class="w-full py-3 px-4 rounded-md font-semibold text-lg transition-all"
          @click="handleForm"
        />

        <p class="text-center text-gray-400 mt-4">
          Don't have an account?
          <router-link
            :to="redirectTo === '/' ? '/register' : `/register?redirect=${redirectTo}`"
            class="text-blue-400 hover:text-blue-300 font-medium"
          >
            Sign up
          </router-link>
        </p>
      </div>
    </form>
  </div>
</template>
