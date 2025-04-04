<script lang="ts" setup>
import FormEntry from '@/components/common/FormEntry.vue'
import { useAuth } from '@/composables/useAuth.ts'
import { useAuthStore } from '@/stores/authStore.ts'
import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import { signInSchema } from '@/schemas/authSchema.ts'
import { computed, onMounted, ref } from 'vue'
import router from '@/router'
import { useErrorsHandler } from '@/composables/useErrorsHandler.ts'
import Background from '@/components/common/Background.vue'
import LoadingButton from '@/components/common/LoadingButton.vue'
import { useSettingsStore } from '@/stores/settingsStore.ts'
import BaseCard from '@/components/common/BaseCard.vue'
import AuthLink from '@/components/common/AuthLink.vue'

const { login } = useAuth()
const auth = useAuthStore()
const settingsStore = useSettingsStore()

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
const handleForm = async () => {
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
        <h1 class="text-5xl font-bold text-zinc-900 dark:text-white mb-6">Sign In</h1>
        <span class="text-gray-600 dark:text-app-violet-200 text-xl mb-2 block">
          Welcome back! Please enter your details.
        </span>
      </div>

      <form class="w-full max-w-md" @submit.prevent="handleForm">
        <!-- Form Fields -->
        <BaseCard>
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
              class="text-sm text-gray-500 hover:text-gray-700 dark:text-app-violet-300 dark:hover:text-app-violet-200 transition-colors"
              to="/forgot"
            >
              Forgot password?
            </router-link>
          </div>
        </BaseCard>

        <!-- Action Section -->
        <div class="flex flex-col gap-6 mt-6">
          <LoadingButton :disable="!canSubmit" :loading="waitingResponse" @click="handleForm">
            {{ auth.isAuthenticated ? 'Already Logged In' : 'Sign In' }}
          </LoadingButton>

          <AuthLink
            :route-to="redirectTo === '/' ? '/register' : `/register?redirect=${redirectTo}`"
            link-text="Sign up"
            title="Don't have an account?"
          />
        </div>
      </form>
    </div>
  </Background>
</template>
