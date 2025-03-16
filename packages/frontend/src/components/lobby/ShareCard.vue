<template>
  <!-- Social Share Card -->
  <div
    class="mb-6 p-4 rounded-xl shadow-md bg-gray-800 bg-opacity-50 border border-gray-600 backdrop-blur-lg w-full"
  >
    <h3 class="text-lg font-semibold text-white mb-3 text-center">Share Lobby</h3>

    <div class="w-full">
      <h3 class="text-sm font-medium text-center text-gray-400 mb-4">Share via</h3>
      <div class="flex items-center justify-center gap-3">
        <button
          v-for="(network, index) in networks"
          :key="index"
          :class="[
            'share-button p-3 rounded-lg transition-all',
            'hover:scale-105 active:scale-100',
            network.bgColor,
          ]"
          @click="shareVia(network)"
        >
          <FontAwesomeIcon :icon="network.icon" class="text-white text-lg" />
        </button>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { faTelegram, faWhatsapp } from '@fortawesome/free-brands-svg-icons'
import { faEnvelope } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

const props = defineProps({
  url: String,
})

const networks = [
  {
    name: 'whatsapp',
    icon: faWhatsapp,
    bgColor: 'bg-green-600 hover:bg-green-700',
    url: (link: string) => `https://wa.me/?text=Join my auction game! ${link}`,
  },
  {
    name: 'telegram',
    icon: faTelegram,
    bgColor: 'bg-blue-500 hover:bg-blue-600',
    url: (link: string) => `https://t.me/share/url?url=${link}&text=Join my auction game!`,
  },
  {
    name: 'email',
    icon: faEnvelope,
    bgColor: 'bg-gray-600 hover:bg-gray-700',
    url: (link: string) => `mailto:?subject=Join my Auction Game&body=Join my game here: ${link}`,
  },
]

const shareVia = (network: (typeof networks)[0]) => {
  if (!props.url) return
  window.open(network.url(props.url), '_blank')
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
