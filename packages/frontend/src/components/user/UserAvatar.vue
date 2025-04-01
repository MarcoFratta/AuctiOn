<template>
  <div :class="sizeClass" class="user-avatar bg-neutral-50 dark:bg-neutral-800 text-app-white">
    {{ initials }}
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { useLobbyStore } from '@/stores/lobbyStore'

const props = defineProps<{
  username: string
  size?: 'small' | 'medium' | 'large'
}>()

const lobbyStore = useLobbyStore()

const initials = computed(() => {
  return props.username
    .split(' ')
    .map((word) => word[0])
    .join('')
    .substring(0, 2)
    .toUpperCase()
})

const sizeClass = computed(() => {
  return props.size || 'medium'
})
</script>

<style scoped>
.user-avatar {
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 50%;
  font-weight: bold;
}

.small {
  width: 32px;
  height: 32px;
  font-size: 0.8rem;
}

.medium {
  width: 48px;
  height: 48px;
  font-size: 1rem;
}

.large {
  width: 64px;
  height: 64px;
  font-size: 1.2rem;
}
</style>
