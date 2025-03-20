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
  <div class="min-h-screen bg-gray-900 flex items-center justify-center p-4">
    <form
      class="bg-gray-800 p-6 lg:p-8 rounded-lg shadow-lg w-full max-w-md flex flex-col gap-4"
      @submit.prevent="handleForm"
    >
      <!-- Header -->
      <div class="mb-6">
        <h2 class="text-2xl font-bold text-white">🔑 Forgot Password</h2>
        <p class="text-gray-400 mt-2">Enter your email to receive a password reset link.</p>
      </div>

      <!-- Success Message -->
      <div v-if="successMessage" class="bg-green-800 text-green-100 p-4 rounded-lg mb-4">
        {{ successMessage }}
      </div>

      <!-- Form Fields -->
      <div v-if="!successMessage" class="bg-gray-700 p-4 rounded-lg space-y-4">
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
      </div>

      <!-- Action Section -->
      <div class="flex flex-col gap-2">
        <LoadingButton
          v-if="!successMessage"
          :class="
            !errors.email ? 'bg-blue-500 hover:bg-blue-600 text-white' : 'bg-gray-600 text-gray-400'
          "
          :disable="!!errors.email || !values.email"
          :loading="waitingResponse"
          class="w-full py-3 px-4 rounded-md font-semibold text-lg transition-all"
          text="Send Reset Link"
          @click="handleForm"
        />

        <router-link
          v-if="successMessage"
          class="bg-blue-500 hover:bg-blue-600 text-white w-full py-3 px-4 rounded-md font-semibold text-lg transition-all text-center"
          to="/login"
        >
          Back to Login
        </router-link>

        <p class="text-center text-gray-400 mt-4">
          Remember your password?
          <router-link class="text-blue-400 hover:text-blue-300 font-medium" to="/login">
            Sign in
          </router-link>
        </p>
      </div>
    </form>
  </div>
</template>
