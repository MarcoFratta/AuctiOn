<template>
  <!-- Social Share Card -->
  <InnerCard class="w-full p-3 space-y-3">
    <!-- Lobby ID Display -->
    <div>
      <h3 class="text-xs font-medium text-center text-neutral-600 dark:text-app-violet-200 mb-1">
        Lobby ID
      </h3>
      <div
        class="bg-neutral-100 dark:bg-neutral-700 rounded-md px-3 py-1 text-center cursor-pointer hover:bg-neutral-200 dark:hover:bg-neutral-600 transition-colors"
        title="Click to copy Lobby ID"
        @click="copyLobbyId"
      >
        <span class="font-mono text-sm text-neutral-700 dark:text-neutral-200">{{ lobbyId }}</span>
        <span v-if="copied" class="ml-2 text-xs text-green-600 dark:text-green-400">(Copied!)</span>
      </div>
    </div>

    <!-- Separator -->
    <hr class="border-neutral-200 dark:border-neutral-600" />

    <!-- Social Sharing -->
    <div>
      <h3 class="text-xs font-medium text-center text-neutral-600 dark:text-app-violet-200 mb-3">
        Share link via
      </h3>
      <div class="flex items-center justify-center gap-3">
        <button
          v-for="(network, index) in networks"
          :key="index"
          :class="[
            'share-button py-1 px-3 rounded-lg transition-all',
            'hover:scale-105 active:scale-100',
            network.bgColor,
          ]"
          :title="`Share on ${network.name}`"
          @click="shareVia(network)"
        >
          <FontAwesomeIcon :icon="network.icon" class="text-white text-base" />
        </button>
      </div>
    </div>
  </InnerCard>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { faTelegram, faWhatsapp } from '@fortawesome/free-brands-svg-icons'
import { faEnvelope } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import InnerCard from '@/components/common/InnerCard.vue'
import { useClipboard } from '@vueuse/core'

const props = defineProps({
  url: {
    type: String,
    required: true,
  },
  lobbyId: {
    type: String,
    required: true,
  },
})

// Clipboard functionality for Lobby ID
const { copy, copied, isSupported } = useClipboard({ source: props.lobbyId })
const copyTimeout = ref<number | null>(null)

const copyLobbyId = () => {
  if (!isSupported.value) {
    // Handle browsers that don't support the Clipboard API if necessary
    console.warn('Clipboard API not supported')
    return
  }
  copy(props.lobbyId)
  // VueUse `copied` ref automatically resets after a timeout (default 1500ms)
  // Clear any existing manual timeout just in case (though likely not needed with VueUse)
  if (copyTimeout.value) clearTimeout(copyTimeout.value)
}

// Social sharing networks configuration
const networks = [
  {
    name: 'WhatsApp',
    icon: faWhatsapp,
    bgColor: 'bg-green-600 hover:bg-green-700',
    url: (link: string) => `https://wa.me/?text=Join my auction game! ${encodeURIComponent(link)}`,
  },
  {
    name: 'Telegram',
    icon: faTelegram,
    bgColor: 'bg-blue-500 hover:bg-blue-600',
    url: (link: string) =>
      `https://t.me/share/url?url=${encodeURIComponent(link)}&text=${encodeURIComponent('Join my auction game!')}`,
  },
  {
    name: 'Email',
    icon: faEnvelope,
    bgColor: 'bg-app-violet-500 hover:bg-app-violet-600',
    url: (link: string) =>
      `mailto:?subject=${encodeURIComponent('Join my Auction Game')}&body=${encodeURIComponent(`Join my game here: ${link}`)}`,
  },
]

// Function to open share links
const shareVia = (network: (typeof networks)[0]) => {
  if (!props.url) return
  window.open(network.url(props.url), '_blank', 'noopener,noreferrer')
}
</script>

<style scoped>
.share-button {
  position: relative;
  overflow: hidden;
}

.share-button::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(rgba(255, 255, 255, 0.1), transparent);
  opacity: 0;
  transition: opacity 0.2s;
}

.share-button:hover::after {
  opacity: 1;
}

.share-button:active::after {
  background: linear-gradient(rgba(0, 0, 0, 0.1), transparent);
}
</style>
