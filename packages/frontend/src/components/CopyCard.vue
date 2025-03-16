<template>
  <div class="relative">
    <div class="flex flex-col sm:flex-row items-center gap-3">
      <div class="relative flex-1 w-full">
        <input
          ref="lobbyLinkInput"
          :value="url"
          class="w-full px-4 py-2.5 pr-12 bg-gray-900 text-gray-200 rounded-lg border border-gray-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-colors text-sm"
          readonly
          type="text"
        />
        <div class="absolute inset-y-0 right-0 flex items-center pr-3">
          <span class="text-gray-500">🔗</span>
        </div>
      </div>
      <button
        class="px-4 py-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-all font-medium text-sm flex items-center gap-2 min-w-[100px] justify-center group"
        @click="copyLink"
      >
        <span class="group-hover:scale-110 transition-transform">📋</span>
        Copy Link
      </button>
    </div>
    <!-- Success Message -->
    <div
      v-if="showSuccess"
      class="absolute -top-12 left-1/2 -translate-x-1/2 px-4 py-2 bg-green-500 text-white rounded-lg text-sm font-medium animate-fade-out flex items-center gap-2"
    >
      <span>✓</span> Link copied!
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

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
