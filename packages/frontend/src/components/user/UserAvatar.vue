<template>
  <div :class="sizeClass" class="user-avatar">
    {{ initials }}
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { useLobbyStore } from '@/stores/lobbyStore'

const props = defineProps<{
  userId: string
  size?: 'small' | 'medium' | 'large'
}>()

const lobbyStore = useLobbyStore()

const username = computed(() => {
  const user = lobbyStore.users.find((u) => u.id === props.userId)
  return user?.username || 'Unknown'
})

const initials = computed(() => {
  return username.value
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
  background-color: var(--color-primary);
  color: white;
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
