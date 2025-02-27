<template>
  <div class="flex flex-col sm:flex-row items-center justify-center gap-3">
    <input
      ref="lobbyLinkInput"
      :value="url"
      class="px-3 py-2 rounded-md bg-gray-700 text-gray-300 w-full sm:w-64 text-center"
      readonly
      type="text"
    />
    <button
      class="px-3 py-2 bg-blue-500 hover:bg-blue-700 text-white rounded-md transition"
      @click="copyLink"
    >
      📋 Copy
    </button>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const props = defineProps({
  url: String,
})

const lobbyLinkInput = ref<HTMLInputElement | null>(null)

const copyLink = async () => {
  if (!props.url) return

  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(props.url)
      alert('✅ Lobby link copied to clipboard!')
    } else {
      // Fallback: Select the text and copy manually
      if (lobbyLinkInput.value) {
        lobbyLinkInput.value.select()
        document.execCommand('copy')
      }
    }
  } catch (err) {
    console.error('❌ Failed to copy link: ', err)
  }
}
</script>
