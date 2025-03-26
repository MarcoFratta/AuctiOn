<script lang="ts" setup>
import { ref } from 'vue'
import FormEntry from '@/components/FormEntry.vue'
import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import * as z from 'zod'
import LoadingButton from '@/components/LoadingButton.vue'
import { useErrorsHandler } from '@/composables/useErrorsHandler.ts'
import { forgotPassword } from '@/api/authService'
import { useRouter } from 'vue-router'
import Background from '@/components/Background.vue'

const router = useRouter()
const errorHandler = useErrorsHandler()

// Create schema for email validation
const forgotPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
})

const schema = toTypedSchema(forgotPasswordSchema)
const { values, errors, defineField } = useForm({
  validationSchema: schema,
})

const [email, emailProps] = defineField('email', {
  props: (state) => ({
    error: state.errors[0],
  }),
})

const waitingResponse = ref(false)
const successMessage = ref('')

const canSubmit = ref(true)

const handleForm = async () => {
  try {
    if (!values.email || errors.value.email) {
      return
    }

    waitingResponse.value = true
    await forgotPassword(values.email)

    // Show success message
    successMessage.value = 'Password reset instructions have been sent to your email'

    // Clear the form
    email.value = ''
  } catch (error) {
    const err = errorHandler
      .create(error)
      .unknownError()
      .notFound('Email not found', 'Please check your email or sign up', () =>
        router.push('/register'),
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
        <h1 class="text-3xl font-bold text-white mb-6">Forgot Password</h1>
        <span class="text-app-violet-200 text-xl block">
          Enter your email to receive a password reset link.
        </span>
      </div>

      <form class="w-full max-w-md" @submit.prevent="handleForm">
        <!-- Success Message -->
        <div
          v-if="successMessage"
          class="bg-app-black-80 backdrop-blur-md border border-green-500/30 p-6 rounded-lg mb-6 text-center"
        >
          <div class="text-green-400 text-lg mb-4">✓ Success</div>
          <p class="text-white">{{ successMessage }}</p>
          <router-link
            class="mt-6 inline-block bg-app-fuchsia-600 hover:bg-app-fuchsia-500 text-white px-6 py-2 rounded-md transition-colors"
            to="/login"
          >
            Back to Login
          </router-link>
        </div>

        <!-- Form Fields -->
        <div
          v-if="!successMessage"
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
        </div>

        <!-- Action Section -->
        <div v-if="!successMessage" class="flex flex-col gap-4">
          <LoadingButton
            :disable="!!errors.email || !values.email"
            :loading="waitingResponse"
            class="w-full py-3"
            text="Send Reset Link"
            @click="handleForm"
          />

          <p class="text-center text-app-violet-200">
            Remember your password?
            <router-link
              class="text-app-fuchsia-600 hover:text-app-fuchsia-500 font-medium"
              to="/login"
            >
              Sign in
            </router-link>
          </p>
        </div>
      </form>
    </div>
  </Background>
</template>
