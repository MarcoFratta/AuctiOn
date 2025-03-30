<template>
  <div
    class="bg-gray-100 dark:bg-neutral-800 p-3 rounded border-l-4 border-violet-500 dark:border-app-fuchsia-600 mt-3"
  >
    <p class="text-gray-600 dark:text-app-violet-300 text-sm italic">
      <span class="text-violet-600 dark:text-app-fuchsia-400 font-semibold">{{ label }}:</span>
      <slot></slot>
    </p>
  </div>
</template>

<script lang="ts" setup>
defineProps({
  label: {
    type: String,
    default: 'Strategy Tip',
  },
})
</script>
