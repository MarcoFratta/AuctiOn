<template>
  <div class="relative">
    <div class="flex flex-col sm:flex-row lg:flex-col items-center gap-2">
      <div class="relative flex-1 w-full">
        <input
          ref="lobbyLinkInput"
          :value="url"
          class="w-full px-3 py-2 pr-10 text-zinc-800 rounded-lg border dark:text-white bg-app-white dark:bg-neutral-800 border-gray-700 focus:border-violet-500 focus:ring-1 focus:ring-violet-500 outline-none transition-colors text-xs"
          readonly
          type="text"
        />
        <div class="absolute inset-y-0 right-0 flex items-center pr-3">
          <span class="text-gray-500">🔗</span>
        </div>
      </div>
      <LoadingButton
        class="transition-all font-medium text-xs w-full flex items-center gap-1 justify-center group py-1.5"
        @click="copyLink"
      >
        <span class="group-hover:scale-110 transition-transform">📋</span>
        Copy Link
      </LoadingButton>
    </div>
    <!-- Success Message -->
    <div
      v-if="showSuccess"
      class="absolute -top-10 left-1/2 -translate-x-1/2 px-3 py-1 bg-green-500 text-white rounded-lg text-xs font-medium animate-fade-out flex items-center gap-1"
    >
      <span>✓</span> Link copied!
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import LoadingButton from '@/components/LoadingButton.vue'

const props = defineProps({
  url: String,
})

const lobbyLinkInput = ref<HTMLInputElement | null>(null)
const showSuccess = ref(false)

const copyLink = async () => {
  if (!props.url) return

  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(props.url)
      showSuccess.value = true
      setTimeout(() => {
        showSuccess.value = false
      }, 2000)
    } else {
      // Fallback: Select the text and copy manually
      if (lobbyLinkInput.value) {
        lobbyLinkInput.value.select()
        document.execCommand('copy')
      }
    }
  } catch (err) {
    console.error('Failed to copy link:', err)
  }
}
</script>

<style scoped>
.animate-fade-out {
  animation: fadeOut 2s ease-in-out;
}

@keyframes fadeOut {
  0%,
  80% {
    opacity: 1;
  }
  100% {
    opacity: 0;
  }
}
</style>
