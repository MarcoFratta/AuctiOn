<script lang="ts" setup>
defineProps({
  title: {
    type: String,
    default: '',
  },
  linkText: {
    type: String,
    required: true,
  },
  routeTo: {
    type: String,
    required: true,
  },
})
</script>

<template>
  <p class="text-center text-zinc-600 dark:text-app-violet-200">
    <template v-if="title">{{ title }}</template>
    <router-link
      :class="title ? 'ml-2' : ''"
      :to="routeTo"
      class="text-app-fuchsia-600 hover:text-app-fuchsia-500 font-medium"
    >
      {{ linkText }}
    </router-link>
  </p>
</template>
