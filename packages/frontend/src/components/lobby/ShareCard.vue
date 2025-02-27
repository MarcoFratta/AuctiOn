<template>
  <!-- Social Share Card -->
  <div
    class="mb-6 p-4 rounded-xl shadow-md bg-gray-800 bg-opacity-50 border border-gray-600 backdrop-blur-lg w-full"
  >
    <h3 class="text-lg font-semibold text-white mb-3 text-center">Share Lobby</h3>

    <div class="flex justify-center gap-3">
      <ShareNetwork
        v-for="(network, index) in networks"
        :key="index"
        :class="network.bgColor"
        :network="network.name"
        :url="url"
        class="share-button p-2 w-10 h-10 flex items-center justify-center rounded-lg shadow-md transition-all"
        title="Join my auction lobby!"
      >
        <FontAwesomeIcon :icon="network.icon" class="text-white text-lg" />
      </ShareNetwork>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { faTelegram, faWhatsapp } from '@fortawesome/free-brands-svg-icons'
import { faEnvelope } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

defineProps({ url: String })

const networks = [
  { name: 'whatsapp', icon: faWhatsapp, bgColor: 'bg-green-500 hover:bg-green-600' },
  { name: 'telegram', icon: faTelegram, bgColor: 'bg-blue-400 hover:bg-blue-500' },
  { name: 'email', icon: faEnvelope, bgColor: 'bg-gray-500 hover:bg-gray-600' },
]
</script>

<style scoped>
.share-button:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(255, 255, 255, 0.15);
}
</style>
