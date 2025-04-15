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
  noScroll: {
    type: Boolean,
    default: false,
  },
  containerClass: {
    type: String,
    default: '',
  },
})
</script>

<template>
  <div id="background" class="flex w-full h-full bg-app-white dark:bg-black">
    <!-- Fixed background with vortex effect -->
    <Vortex
      :backgroundColor="bgColor"
      :baseHue="baseHue"
      :particle-count="settingsStore.darkMode ? 150 : 150"
      :particleOpacity="particleOpacity"
      :range-speed="settingsStore.darkMode ? 0.5 : 0.4"
      :range-y="150"
      class="fixed top-0 z-0 overflow-hidden"
      containerClass="fixed"
    />
    <!-- Content layer that scrolls over the background -->
    <div class="relative size-full z-10">
      <BlurReveal :delay="0.2" :duration="0.75" class="size-full overflow-hidden">
        <FullScreen
          :containerCls="
            containerClass +
            ' scrollbar-hide ' +
            (noScroll ? 'h-[calc(100%)]' + ' overflow-hidden' : '')
          "
        >
          <slot />
        </FullScreen>
      </BlurReveal>
    </div>
  </div>
</template>
