<script lang="ts" setup>
import AppIcons from '@/components/icons/AppIcons.vue'

const props = defineProps<{
  title: string
  iconName: string
  iconColor?: string
}>()

// Default color if not provided
const color = props.iconColor || 'violet'
</script>

<template>
  <div class="flex items-center justify-between">
    <div class="flex items-center gap-1.5">
      <AppIcons :color="color" :name="iconName" size="sm" />
      <h2 class="text-base font-semibold text-zinc-900 dark:text-white">{{ title }}</h2>
    </div>

    <!-- Slot for right-side content -->
    <slot></slot>
  </div>
</template>
