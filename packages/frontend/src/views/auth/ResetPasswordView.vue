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

const router = useRouter()
const route = useRoute()
const errorHandler = useErrorsHandler()

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
  <div class="min-h-screen bg-gray-900 flex items-center justify-center p-4">
    <form
      class="bg-gray-800 p-6 lg:p-8 rounded-lg shadow-lg w-full max-w-md flex flex-col gap-4"
      @submit.prevent="handleForm"
    >
      <!-- Header -->
      <div class="mb-6">
        <h2 class="text-2xl font-bold text-white">🔐 Reset Password</h2>
        <p class="text-gray-400 mt-2">Create a new password for your account.</p>
      </div>

      <!-- Success Message -->
      <div v-if="successMessage" class="bg-green-800 text-green-100 p-4 rounded-lg mb-4">
        {{ successMessage }}
      </div>

      <!-- Form Fields -->
      <div v-if="!successMessage" class="bg-gray-700 p-4 rounded-lg space-y-4">
        <div class="space-y-1">
          <label class="block text-sm font-medium text-gray-300" for="password">New Password</label>
          <FormEntry
            id="password"
            v-model="password"
            autocomplete="new-password"
            placeHolder="Enter your new password"
            type="password"
            v-bind="passwordProps"
          />
        </div>
        <div class="space-y-1">
          <label class="block text-sm font-medium text-gray-300" for="repeatPassword"
            >Confirm Password</label
          >
          <FormEntry
            id="repeatPassword"
            v-model="repeatPassword"
            autocomplete="new-password"
            placeHolder="Confirm your new password"
            type="password"
            v-bind="repeatPasswordProps"
          />
        </div>
      </div>

      <!-- Action Section -->
      <div class="flex flex-col gap-2">
        <LoadingButton
          v-if="!successMessage"
          :class="
            !errors.password && !errors.repeatPassword && values.password && values.repeatPassword
              ? 'bg-blue-500 hover:bg-blue-600 text-white'
              : 'bg-gray-600 text-gray-400'
          "
          :disable="
            !!errors.password ||
            !!errors.repeatPassword ||
            !values.password ||
            !values.repeatPassword
          "
          :loading="waitingResponse"
          class="w-full py-3 px-4 rounded-md font-semibold text-lg transition-all"
          text="Reset Password"
          @click="handleForm"
        />

        <router-link
          v-if="successMessage"
          class="bg-blue-500 hover:bg-blue-600 text-white w-full py-3 px-4 rounded-md font-semibold text-lg transition-all text-center"
          to="/login"
        >
          Go to Login
        </router-link>

        <p class="text-center text-gray-400 mt-4">
          <router-link class="text-blue-400 hover:text-blue-300 font-medium" to="/login">
            Back to Login
          </router-link>
        </p>
      </div>
    </form>
  </div>
</template>
