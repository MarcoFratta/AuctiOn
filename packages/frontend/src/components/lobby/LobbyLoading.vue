<template>
  <div class="w-full max-w-4xl mx-auto px-4 py-6 flex items-center justify-center">
    <div class="w-full max-w-md">
      <BaseCard class="relative overflow-hidden">
        <!-- Animated shapes in background -->
        <div class="absolute -top-10 -left-10 opacity-20">
          <GameShapes
            :color="settingsStore.darkMode ? 'violet' : 'default'"
            animated
            size="lg"
            type="circle"
          />
        </div>
        <div class="absolute -bottom-10 -right-10 opacity-20">
          <GameShapes
            :color="settingsStore.darkMode ? 'fuchsia' : 'default'"
            animated
            size="lg"
            type="triangle"
          />
        </div>

        <div class="flex flex-col items-center justify-center py-8 px-4 relative z-10">
          <!-- Pulsing logo -->
          <div class="mb-6 animate-pulse">
            <div class="w-20 h-20 relative">
              <div
                class="absolute inset-0 bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-full opacity-30 animate-ping"
              ></div>
              <div
                class="relative flex items-center justify-center w-full h-full bg-white dark:bg-gray-800 rounded-full border-2 border-violet-300 dark:border-violet-700"
              >
                <GameShapes color="violet" size="md" type="square" />
              </div>
            </div>
          </div>

          <!-- Loading text -->
          <h2 class="text-2xl font-bold text-zinc-900 dark:text-white mb-4 text-center">
            {{ title }}
          </h2>

          <!-- Loading indicator -->
          <div class="flex space-x-2 mb-6">
            <div class="w-3 h-3 rounded-full bg-violet-500 dark:bg-violet-400 animate-bounce"></div>
            <div
              class="w-3 h-3 rounded-full bg-fuchsia-500 dark:bg-fuchsia-400 animate-bounce"
              style="animation-delay: 0.2s"
            ></div>
            <div
              class="w-3 h-3 rounded-full bg-violet-500 dark:bg-violet-400 animate-bounce"
              style="animation-delay: 0.4s"
            ></div>
          </div>

          <!-- Helpful message -->
          <p class="text-gray-600 dark:text-app-violet-200 text-center mb-4">
            {{ message }}
          </p>

          <!-- Tips in a card -->
          <InnerCard v-if="showTip" class="w-full mt-2">
            <div class="flex items-start">
              <div class="mr-3 mt-1 text-yellow-500">💡</div>
              <div>
                <h3 class="text-sm font-semibold text-zinc-900 dark:text-white mb-1">
                  {{ tipTitle }}
                </h3>
                <p class="text-xs text-gray-600 dark:text-app-violet-200">
                  {{ tipText }}
                </p>
              </div>
            </div>
          </InnerCard>
        </div>
      </BaseCard>
    </div>
  </div>
</template>

<script lang="ts" setup>
import BaseCard from '@/components/common/BaseCard.vue'
import InnerCard from '@/components/common/InnerCard.vue'
import GameShapes from '@/components/icons/GameShapes.vue'
import { useSettingsStore } from '@/stores/settingsStore.ts'

const settingsStore = useSettingsStore()

defineProps({
  title: {
    type: String,
    default: 'Connecting to Lobby',
  },
  message: {
    type: String,
    default: 'Please wait while we establish a connection to the auction lobby.',
  },
  showTip: {
    type: Boolean,
    default: true,
  },
  tipTitle: {
    type: String,
    default: 'Connection Tips',
  },
  tipText: {
    type: String,
    default:
      'If this takes too long, try refreshing the page or checking your internet connection.',
  },
})
</script>

<style scoped>
/* Animation for the loading state */
@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes ping {
  75%,
  100% {
    transform: scale(1.5);
    opacity: 0;
  }
}

.animate-ping {
  animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;
}

@keyframes bounce {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-5px);
  }
}

.animate-bounce {
  animation: bounce 1s infinite;
}
</style>
