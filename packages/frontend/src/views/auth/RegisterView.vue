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
import Background from '@/components/Background.vue'

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
  <Background>
    <div class="flex flex-col items-center justify-center py-8 px-4">
      <!-- Header -->
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold text-white mb-6">Create Account</h1>
        <span class="text-app-violet-200 text-xl block">
          Join us! Fill in your details below.
        </span>
      </div>

      <form class="w-full max-w-md" @submit.prevent="handleForm">
        <!-- Form Fields -->
        <div
          class="bg-app-black-80 backdrop-blur-md border border-app-violet-900/30 p-6 rounded-lg space-y-4 mb-6"
        >
          <div class="space-y-2">
            <FormEntry
              id="name"
              v-model="name"
              :class="{ '!border-red-500': errors.name }"
              autocomplete="name"
              class="w-full"
              placeHolder="Enter your username"
              title="Username"
              v-bind="nameProps"
            />
          </div>
          <div class="space-y-2">
            <FormEntry
              id="email"
              v-model="email"
              :class="{ '!border-red-500': errors.email }"
              autocomplete="email"
              class="w-full"
              placeHolder="Enter your email"
              title="Email"
              v-bind="emailProps"
            />
          </div>
          <div class="space-y-2">
            <FormEntry
              id="password"
              v-model="password"
              :class="{ '!border-red-500': errors.password }"
              autocomplete="new-password"
              class="w-full"
              placeHolder="Enter your password"
              title="Password"
              type="password"
              v-bind="passwordProps"
            />
          </div>
          <div class="space-y-2">
            <FormEntry
              id="repeat"
              v-model="repeat"
              :class="{ '!border-red-500': repeatProps.error }"
              autocomplete="new-password"
              class="w-full"
              placeHolder="Confirm your password"
              title="Repeat Password"
              type="password"
              v-bind="repeatProps"
            />
          </div>
        </div>

        <!-- Action Section -->
        <div class="flex flex-col gap-4">
          <LoadingButton
            :disable="!canSubmit"
            :loading="waitingResponse"
            :text="isAuthenticated ? 'Already Logged In' : 'Create Account'"
            class="w-full py-3"
            @click="handleForm"
          />

          <p class="text-center text-app-violet-200">
            Already have an account?
            <router-link
              :to="redirectTo === '/' ? '/login' : `/login?redirect=${redirectTo}`"
              class="text-app-fuchsia-600 hover:text-app-fuchsia-500 font-medium"
            >
              Sign in
            </router-link>
          </p>
        </div>
      </form>
    </div>
  </Background>
</template>
