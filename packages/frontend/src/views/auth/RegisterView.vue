<script lang="ts" setup>
import { computed, onMounted, ref } from 'vue'
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
      repeatProps.value.error
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
onMounted(() => {
  if (isAuthenticated.value) {
    router.push('/')
  }
})
</script>

<template>
  <div class="min-h-screen bg-gray-900 flex items-center justify-center p-4">
    <form
      class="bg-gray-800 p-6 lg:p-8 rounded-lg shadow-lg w-full max-w-md flex flex-col gap-4"
      @submit.prevent="handleForm"
    >
      <!-- Header -->
      <div class="mb-6">
        <h2 class="text-2xl font-bold text-white">✨ Create Account</h2>
        <p class="text-gray-400 mt-2">Fill in your information to get started.</p>
      </div>

      <!-- Form Fields -->
      <div class="bg-gray-700 p-4 rounded-lg space-y-4">
        <div class="space-y-1">
          <label class="block text-sm font-medium text-gray-300" for="name">Name</label>
          <FormEntry
            id="name"
            v-model="name"
            autocomplete="name"
            placeHolder="Enter your name"
            v-bind="nameProps"
          />
        </div>
        <div class="space-y-1">
          <label class="block text-sm font-medium text-gray-300" for="email">Email</label>
          <FormEntry
            id="email"
            v-model="email"
            autocomplete="email"
            placeHolder="Enter your email"
            v-bind="emailProps"
          />
        </div>
        <div class="space-y-1">
          <label class="block text-sm font-medium text-gray-300" for="password">Password</label>
          <FormEntry
            id="password"
            v-model="password"
            autocomplete="new-password"
            placeHolder="Enter your password"
            type="password"
            v-bind="passwordProps"
          />
        </div>
        <div class="space-y-1">
          <label class="block text-sm font-medium text-gray-300" for="repeat"
            >Confirm Password</label
          >
          <FormEntry
            id="repeat"
            v-model="repeat"
            autocomplete="new-password"
            placeHolder="Confirm your password"
            type="password"
            v-bind="repeatProps"
          />
        </div>
      </div>

      <!-- Action Section -->
      <div class="flex flex-col gap-2">
        <LoadingButton
          :class="
            canSubmit ? 'bg-green-500 hover:bg-green-600 text-white' : 'bg-gray-600 text-gray-400'
          "
          :disable="!canSubmit"
          :loading="waitingResponse"
          :text="isAuthenticated ? 'Already Logged In' : 'Create Account'"
          class="w-full py-3 px-4 rounded-md font-semibold text-lg transition-all"
          @click="handleForm"
        />

        <p class="text-center text-gray-400 mt-4">
          Already have an account?
          <router-link
            :to="redirectTo === '/' ? '/login' : `/login?redirect=${redirectTo}`"
            class="text-blue-400 hover:text-blue-300 font-medium"
          >
            Sign in
          </router-link>
        </p>
      </div>
    </form>
  </div>
</template>
