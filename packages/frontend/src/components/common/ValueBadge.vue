<script lang="ts" setup>
import { computed } from 'vue'

type ColorTheme = 'violet' | 'orange' | 'red'

const props = withDefaults(
  defineProps<{
    value: number | string
    colorTheme?: ColorTheme
  }>(),
  {
    colorTheme: 'violet', // Default theme
  },
)

const themeClasses = computed(() => {
  switch (props.colorTheme) {
    case 'orange':
      return 'bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400'
    case 'red':
      return 'bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400'
    case 'violet':
    default:
      return 'bg-violet-50 dark:bg-app-violet-500/10 text-violet-700 dark:text-app-violet-300'
  }
})

const baseClasses = 'px-1.5 py-0.5 rounded text-xs font-medium min-w-[1.5rem] text-center'
</script>

<template>
  <div :class="[baseClasses, themeClasses]">
    {{ value }}
  </div>
</template>
