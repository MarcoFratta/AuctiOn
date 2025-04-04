<script lang="ts" setup>
defineProps({
  text: String,
})
</script>

<template>
  <div class="bg-gray-700 p-4 rounded-full text-white px-4 py-1">{{ text }}</div>
</template>

<style scoped></style>
