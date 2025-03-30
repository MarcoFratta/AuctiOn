<script lang="ts" setup>
import { onMounted, ref } from 'vue'
import FormEntry from '@/components/FormEntry.vue'
import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import LoadingButton from '@/components/LoadingButton.vue'
import { useErrorsHandler } from '@/composables/useErrorsHandler.ts'
import { resetPassword } from '@/api/authService'
import { useRoute, useRouter } from 'vue-router'
import { baseSignUpSchema } from '@/schemas/authSchema.ts'
import Background from '@/components/Background.vue'
import { useSettingsStore } from '@/stores/settingsStore.ts'
import AuthLink from '@/components/AuthLink.vue'
import BaseCard from '@/components/BaseCard.vue'

const router = useRouter()
const route = useRoute()
const errorHandler = useErrorsHandler()
const settingsStore = useSettingsStore()

// Get token from route params
const token = ref('')

onMounted(() => {
  token.value = route.params.token as string

  if (!token.value) {
    router.push('/login')
  }
})

// Create schema for password validation
const resetPasswordSchema = baseSignUpSchema.pick({
  password: true,
  repeatPassword: true,
})
const schema = toTypedSchema(resetPasswordSchema)
const { values, errors, defineField } = useForm({
  validationSchema: schema,
})

const [password, passwordProps] = defineField('password', {
  props: (state) => ({
    error: state.errors[0],
  }),
})

const [repeatPassword, repeatPasswordProps] = defineField('repeatPassword', {
  props: (state) => ({
    error: state.value === values.password ? undefined : 'Passwords do not match,',
  }),
})

const waitingResponse = ref(false)
const successMessage = ref('')

const canSubmit = ref(true)

const handleForm = async () => {
  try {
    if (
      !values.password ||
      !values.repeatPassword ||
      errors.value.password ||
      errors.value.repeatPassword
    ) {
      return
    }

    waitingResponse.value = true
    await resetPassword(token.value, values.password)

    // Show success message
    successMessage.value = 'Your password has been reset successfully'
  } catch (error) {
    const err = errorHandler
      .create(error)
      .unknownError()
      .invalidData('Invalid or expired token', 'Please request a new password reset link', () =>
        router.push('/forgot-password'),
      )
      .tooManyRequests()

    await errorHandler.showAndRun(err)
  } finally {
    waitingResponse.value = false
  }
}
</script>

<template>
  <Background>
    <div class="flex flex-col items-center justify-center py-8 px-4">
      <!-- Header -->
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold text-zinc-900 dark:text-white mb-6">Reset Password</h1>
        <span class="text-gray-600 dark:text-app-violet-200 text-xl block">
          Create a new password for your account.
        </span>
      </div>

      <form class="w-full max-w-md" @submit.prevent="handleForm">
        <!-- Success Message -->
        <div
          v-if="successMessage"
          class="bg-white/90 dark:bg-app-black-80 backdrop-blur-md border border-green-500/30 p-6 rounded-lg mb-6 text-center"
        >
          <div class="text-green-600 dark:text-green-400 text-lg mb-4">✓ Success</div>
          <p class="text-gray-800 dark:text-white">{{ successMessage }}</p>
          <router-link
            class="mt-6 inline-block bg-indigo-600 hover:bg-indigo-500 dark:bg-app-fuchsia-600 dark:hover:bg-app-fuchsia-500 text-white px-6 py-2 rounded-md transition-colors"
            to="/login"
          >
            Go to Login
          </router-link>
        </div>

        <!-- Form Fields -->
        <BaseCard v-if="!successMessage">
          <div class="space-y-2">
            <FormEntry
              id="password"
              v-model="password"
              :class="{ '!border-red-500': errors.password }"
              autocomplete="new-password"
              class="w-full"
              placeHolder="Enter your new password"
              title="New Password"
              type="password"
              v-bind="passwordProps"
            />
          </div>
          <div class="space-y-2">
            <FormEntry
              id="repeatPassword"
              v-model="repeatPassword"
              :class="{ '!border-red-500': errors.repeatPassword }"
              autocomplete="new-password"
              class="w-full"
              placeHolder="Confirm your new password"
              title="Confirm Password"
              type="password"
              v-bind="repeatPasswordProps"
            />
          </div>
        </BaseCard>

        <!-- Action Section -->
        <div v-if="!successMessage" class="flex flex-col gap-6 mt-6">
          <LoadingButton
            :disable="
              !!errors.password ||
              !!errors.repeatPassword ||
              !values.password ||
              !values.repeatPassword
            "
            :loading="waitingResponse"
            text="Reset Password"
            @click="handleForm"
          />
          <AuthLink linkText="Back to login" route-to="/login" title="" />
        </div>
      </form>
    </div>
  </Background>
</template>
