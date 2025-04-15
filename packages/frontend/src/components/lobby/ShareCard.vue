<template>
  <!-- Social Share Card -->
  <InnerCard class="w-full p-3">
    <h3 class="text-xs font-medium text-center text-gray-600 dark:text-app-violet-200 mb-3">
      Share via
    </h3>
    <div class="flex items-center justify-center gap-3">
      <button
        v-for="(network, index) in networks"
        :key="index"
        :class="[
          'share-button py-1 px-3  rounded-lg transition-all',
          'hover:scale-105 active:scale-100',
          network.bgColor,
        ]"
        @click="shareVia(network)"
      >
        <FontAwesomeIcon :icon="network.icon" class="text-white text-base" />
      </button>
    </div>
  </InnerCard>
</template>

<script lang="ts" setup>
import { faTelegram, faWhatsapp } from '@fortawesome/free-brands-svg-icons'
import { faEnvelope } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import InnerCard from '@/components/common/InnerCard.vue'

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
    bgColor: 'bg-app-violet-500 hover:bg-app-violet-600',
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
