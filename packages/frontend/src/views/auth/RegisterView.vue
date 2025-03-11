<script lang="ts" setup>
import { computed, ref } from 'vue'
import { useAuth } from '@/composables/useAuth.ts'
import FormEntry from '@/components/FormEntry.vue'
import { useAuthStore } from '@/stores/authStore.ts'
import { useForm } from 'vee-validate'
import { signUpSchema } from '@/schemas/authSchema.ts'
import { toTypedSchema } from '@vee-validate/zod'
import LoadingButton from '@/components/LoadingButton.vue'
import { InvalidData } from '@/api/Errors.ts'
import { useErrorsHandler } from '@/composables/useErrorsHandler.ts'
import { useRouter } from 'vue-router'

const { register } = useAuth()
const schema = toTypedSchema(signUpSchema)
const errorHandler = useErrorsHandler()
const router = useRouter()
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
const redirectTo = (
  typeof router.currentRoute.value.query.redirect === 'string'
    ? router.currentRoute.value.query.redirect
    : '/'
) as string
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
const handleForm = async () => {
  try {
    await validate() // handle validation when all fields are empty and submit is clicked
    if (!canSubmit.value) throw new InvalidData()
    waitingResponse.value = true
    await register(values.name!, values.email!, values.password!)
    router.push(redirectTo)
  } catch (error) {
    const e = errorHandler
      .create(error)
      .unknownError('Error', 'An error occurred')
      .alreadySignedUp('User already registered', 'Please sign in', () => {
        router.push(redirectTo == '/' ? '/login' : `/login?redirect=${redirectTo}`)
      })
      .invalidData('Invalid data', 'Please check your data')
    await errorHandler.showAndRun(e)
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
      <router-link
        :to="redirectTo === '/' ? '/login' : `/login?redirect=${redirectTo}`"
        class="text-blue-500 hover:underline"
        >Sign in
      </router-link>
    </p>
  </form>
</template>
