<script lang="ts" setup>
import FormEntry from '@/components/FormEntry.vue'
import { useAuth } from '@/composables/useAuth.ts'
import { useAuthStore } from '@/stores/authStore.ts'
import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import { signInSchema } from '@/schemas/authSchema.ts'
import { computed, onMounted, ref } from 'vue'
import router from '@/router'
import { GradientButton } from '@/components/ui/gradient-button'
import { useErrorsHandler } from '@/composables/useErrorsHandler.ts'
import Background from '@/components/Background.vue'

const { login } = useAuth()
const auth = useAuthStore()

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
      .passwordIncorrect()
      .invalidData('Incorrect password', 'Please try again')
      .tooManyRequests()
    await errorHandler.showAndRun(err)
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
    <div class="flex flex-col items-center justify-center px-4">
      <!-- Header -->
      <div class="text-center mb-8">
        <h1 class="text-5xl font-bold text-white mb-6">Sign In</h1>
        <span class="text-app-violet-200 text-xl mb-2 block">
          Welcome back! Please enter your details.
        </span>
      </div>

      <form class="w-full max-w-md" @submit.prevent="handleForm">
        <!-- Form Fields -->
        <div
          class="bg-app-black-80 backdrop-blur-md border border-app-violet-900/30 p-6 rounded-lg space-y-4 mb-6"
        >
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
              autocomplete="current-password"
              class="w-full"
              placeHolder="Enter your password"
              title="Password"
              type="password"
              v-bind="passwordProps"
            />
          </div>

          <div class="flex justify-end">
            <router-link
              class="text-sm text-app-violet-300 hover:text-app-violet-200 transition-colors"
              to="/forgot"
            >
              Forgot password?
            </router-link>
          </div>
        </div>

        <!-- Action Section -->
        <div class="flex flex-col gap-4">
          <GradientButton
            :class="!canSubmit ? 'disabled opacity-50 cursor-not-allowed' : ''"
            :colors="['#ff00ff', '#9900ff', '#6600ff']"
            :duration="3500"
            bgColor="app-black-DEFAULT"
            class="w-full py-3"
            @click="handleForm"
          >
            {{ auth.isAuthenticated ? 'Already Logged In' : 'Sign In' }}
          </GradientButton>

          <p class="text-center text-app-violet-200">
            Don't have an account?
            <router-link
              :to="redirectTo === '/' ? '/register' : `/register?redirect=${redirectTo}`"
              class="text-app-fuchsia-600 hover:text-app-fuchsia-500 font-medium"
            >
              Sign up
            </router-link>
          </p>
        </div>
      </form>
    </div>
  </Background>
</template>
