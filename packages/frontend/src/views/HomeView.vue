<script lang="ts" setup>
import { useUserStore } from '@/stores/userStore.ts'

const user = useUserStore().user
</script>

<template>
  <section class="flex center items-center justify-center h-screen">
    <p>{{ user }}</p>
  </section>
</template>

<style scoped></style>
