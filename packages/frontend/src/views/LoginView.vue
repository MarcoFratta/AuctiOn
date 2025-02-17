<script lang="ts" setup>
import FormEntry from '@/components/FormEntry.vue'
import { useAuth } from '@/composables/useAuth.ts'
import { useAuthStore } from '@/stores/authStore.ts'
import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import { signInSchema } from '@/schemas/authSchema.ts'
import { computed, ref } from 'vue'
import router from '@/router'
import { NotFound, PasswordIncorrect, TooManyRequests } from '@/api/Errors.ts'
import { useAlert } from '@/composables/useAlert.ts'
import LoadingButton from '@/components/LoadingButton.vue'

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
const alerts = useAlert()
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
const handleForm = async (event: Event) => {
  try {
    console.log('canSubmit', canSubmit.value)
    if (!canSubmit.value) throw new Error('Invalid form')
    waitingResponse.value = true
    await login(values.email!, values.password!)
    router.push('/')
  } catch (e) {
    if (e instanceof NotFound) {
      await alerts.error('Account not found', 'Please sign up')
      router.push('/register')
    } else if (e instanceof PasswordIncorrect) {
      await alerts.error('Incorrect password', 'Please try again')
    } else if (e instanceof TooManyRequests) {
      await alerts.error('Too many requests', 'Please try again later')
    } else {
      await alerts.error('Error', 'An error occurred')
    }
  } finally {
    waitingResponse.value = false
  }
}
</script>

<template>
  <form
    class="bg-gray-300 p-6 rounded-lg shadow-md w-80 mx-auto flex flex-col gap-4 space-y-4 items-center"
    @submit.prevent="handleForm"
  >
    <h2 class="text-2xl font-semibold text-gray-800 mb-4">Sign in</h2>

    <FormEntry
      v-model="email"
      autocomplete="email"
      placeHolder="Enter your email"
      title="Email"
      type="email"
      v-bind="emailProps"
    />
    <FormEntry
      v-model="password"
      autocomplete="current-password"
      placeHolder="Enter your password"
      title="Password"
      v-bind="passwordProps"
      type="password"
    />

    <!-- Submit Button -->
    <LoadingButton
      :disable="!canSubmit"
      :loading="waitingResponse"
      :text="auth.isAuthenticated ? 'Already Logged In' : 'Submit'"
      @click="handleForm"
    />

    <p class="text-sm text-gray-600 mt-4">
      Don't have an account?
      <router-link class="text-blue-500 hover:underline" to="/register">Sign up</router-link>
    </p>
  </form>
</template>
