<template>
  <div class="flex w-full flex-col items-center mb-4 px-2 relative">
    <!-- Left animated shape -->
    <div class="absolute top-5 -left-5 opacity-50 hidden md:block">
      <GameShapes
        :color="settingsStore.darkMode ? 'violet' : 'default'"
        animated
        size="md"
        type="circle"
      />
    </div>

    <!-- Right animated shape -->
    <div class="absolute top-5 -right-5 opacity-50 hidden md:block">
      <GameShapes
        :color="settingsStore.darkMode ? 'fuchsia' : 'default'"
        animated
        size="md"
        type="triangle"
      />
    </div>

    <!-- Title and subtitle -->
    <Title class="text-3xl md:text-4xl mb-2">{{ title }}</Title>
    <p class="text-gray-600 dark:text-app-violet-200 text-center max-w-md text-sm md:text-base">
      {{ subtitle }}
    </p>
  </div>
</template>

<script lang="ts" setup>
import Title from '@/components/common/Title.vue'
import GameShapes from '@/components/icons/GameShapes.vue'
import { useSettingsStore } from '@/stores/settingsStore.ts'

defineProps({
  title: {
    type: String,
    required: true,
  },
  subtitle: {
    type: String,
    required: true,
  },
})

const settingsStore = useSettingsStore()
</script>
