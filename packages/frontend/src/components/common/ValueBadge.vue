<script lang="ts" setup>
import { computed } from 'vue'

type ColorTheme = 'violet' | 'orange' | 'red' | 'emerald'

const props = withDefaults(
  defineProps<{
    value: number | string
    colorTheme?: ColorTheme
    tooltip?: string
  }>(),
  {
    colorTheme: 'violet', // Default theme
    tooltip: undefined, // Default tooltip to undefined
  },
)

const themeClasses = computed(() => {
  switch (props.colorTheme) {
    case 'orange':
      return 'bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400'
    case 'red':
      return 'bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400'
    case 'emerald':
      return 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
    case 'violet':
    default:
      return 'bg-violet-50 dark:bg-app-violet-500/10 text-violet-700 dark:text-app-violet-300'
  }
})

const baseClasses = 'px-1.5 py-0.5 rounded text-xs font-medium min-w-[2rem] text-center'
</script>

<template>
  <div :class="[baseClasses, themeClasses]" :title="tooltip">
    {{ value }}
  </div>
</template>
