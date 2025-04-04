<script lang="ts" setup>
import { Vortex } from '@/components/ui/vortex'
import { BlurReveal } from '@/components/ui/blur-reveal'
import { useSettingsStore } from '@/stores/settingsStore.ts'
import { computed } from 'vue'
import FullScreen from '@/components/common/FullScreen.vue'

const settingsStore = useSettingsStore()
const bgColor = computed(() => (settingsStore.darkMode ? 'black' : '#f8f9fa'))

// Base hue for the particles - adjust for better visibility in light mode
const baseHue = 250
const particleOpacity = computed(() => (settingsStore.darkMode ? 0.7 : 1))
defineProps({
  containerClass: {
    type: String,
    default: 'flex justify-center items-center',
  },
})
</script>

<template>
  <div
    id="background"
    :class="settingsStore.darkMode ? 'bg-black' : 'bg-app-white'"
    class="w-full min-h-[calc(100vh-3rem)] overflow-hidden"
  >
    <!-- Fixed background with vortex effect -->
    <Vortex
      :backgroundColor="bgColor"
      :baseHue="baseHue"
      :particle-count="settingsStore.darkMode ? 150 : 150"
      :particleOpacity="particleOpacity"
      :range-speed="settingsStore.darkMode ? 0.5 : 0.4"
      :range-y="150"
      class="sticky top-0 w-full h-full min-h-[calc(100vh-3rem)]"
    >
      <!-- Content layer that scrolls over the background -->
      <div class="w-full min-h-[calc(100vh-3rem)] z-10">
        <BlurReveal :delay="0.2" :duration="0.75">
          <FullScreen :class="containerClass">
            <slot />
          </FullScreen>
        </BlurReveal>
      </div>
    </Vortex>
  </div>
</template>
