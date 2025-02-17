<script lang="ts" setup>
import { computed, ref } from 'vue'
import { useAuth } from '../composables/useAuth.ts'
import FormEntry from '../components/FormEntry.vue'
import { useAuthStore } from '@/stores/authStore.ts'
import { useForm } from 'vee-validate'
import { signUpSchema } from '@/schemas/authSchema.ts'
import { toTypedSchema } from '@vee-validate/zod'
import router from '@/router/index.ts'
import { useAlert } from '@/composables/useAlert.ts'
import LoadingButton from '@/components/LoadingButton.vue'
import { InvalidData, UserAlreadyRegistered } from '@/api/Errors.ts'

const { register } = useAuth()
const alerts = useAlert()
const schema = toTypedSchema(signUpSchema)
const { values, errors, defineField, validate } = useForm({
  validationSchema: schema,
})
const [name, nameProps] = defineField('name', {
  props: (state) => ({
    error: state.errors[0],
  }),
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
const [repeat, repeatProps] = defineField('repeatPassword', {
  props: (state) => ({
    error: state.value === values.password ? undefined : 'Passwords do not match,',
  }),
})
const isAuthenticated = computed(() => useAuthStore().isAuthenticated)
const canSubmit = computed(
  () =>
    !(
      isAuthenticated.value ||
      !values.email ||
      !values.password ||
      !values.name ||
      !values.repeatPassword ||
      errors.value.email ||
      errors.value.password ||
      errors.value.name ||
      errors.value.repeatPassword
    ),
)
const waitingResponse = ref(false)
const handleForm = async (event: Event) => {
  try {
    await validate() // handle validation when all fields are empty and submit is clicked
    if (!canSubmit.value) throw new InvalidData()
    waitingResponse.value = true
    await register(values.name!, values.email!, values.password!)
  } catch (error) {
    if (error instanceof UserAlreadyRegistered) {
      await alerts.error('User already registered', 'Please sign in')
      router.push('/login')
    } else if (error instanceof InvalidData) {
      await alerts.error('Invalid data', 'Please check your data')
    } else if (error instanceof Error) {
      await alerts.error('Error', error.message)
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
    <h2 class="text-2xl font-semibold text-gray-800 mb-4">Register</h2>

    <!-- Email Input -->
    <FormEntry
      v-model="name"
      autocomplete="name"
      placeHolder="Enter your name"
      title="Name"
      v-bind="nameProps"
    />
    <FormEntry
      v-model="email"
      autocomplete="email"
      placeHolder="Enter your email"
      title="Email"
      v-bind="emailProps"
    />
    <FormEntry
      v-model="password"
      autocomplete="new-password"
      placeHolder="Enter your password"
      title="Password"
      type="password"
      v-bind="passwordProps"
    />
    <FormEntry
      v-model="repeat"
      autocomplete="new-password"
      placeHolder="Confirm your password"
      title="Confirm Password"
      type="password"
      v-bind="repeatProps"
    />

    <!-- Submit Button -->
    <LoadingButton
      :disable="!canSubmit"
      :loading="waitingResponse"
      :class="{
        'cursor-not-allowed': isAuthenticated,
      }"
      :text="isAuthenticated ? 'Already Logged In' : 'Submit'"
      @click="handleForm"
    >
    </LoadingButton>

    <p class="text-sm text-gray-600 mt-4">
      Already have an account?
      <router-link class="text-blue-500 hover:underline" to="/login">Sign in</router-link>
    </p>
  </form>
</template>
