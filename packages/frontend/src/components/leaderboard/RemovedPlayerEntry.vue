<template>
  <div
    :class="[
      isCurrentPlayer ? 'bg-blue-900 bg-opacity-30' : 'bg-gray-700',
      'hover:bg-gray-600 transition-colors',
    ]"
    class="grid grid-cols-12 gap-2 p-2 rounded-md items-center opacity-70"
  >
    <!-- Player - Mobile: 4 cols, Desktop: 5 cols -->
    <div class="col-span-4 sm:col-span-5 flex items-center gap-2">
      <UserAvatar :user-id="player.id" size="small" />
      <span class="text-white font-medium text-sm truncate">{{ getUsername(player.id) }}</span>
    </div>

    <!-- Inventory - Mobile: 5 cols, Desktop: 5 cols -->
    <div class="col-span-5 sm:col-span-5">
      <InventoryDisplay :inventory="player.inventory" compact />
    </div>

    <!-- Money - Mobile: 3 cols, Desktop: 2 cols -->
    <div class="col-span-3 sm:col-span-2 text-right text-gray-400 font-bold">
      {{ formatMoney(player.money) }}
    </div>
  </div>
</template>

<script lang="ts" setup>
import type { LeaderboardEntry } from '@auction/common'
import { useLobbyStore } from '@/stores/lobbyStore'
import UserAvatar from '@/components/user/UserAvatar.vue'
import InventoryDisplay from '@/components/inventory/InventoryDisplay.vue'

const props = defineProps<{
  player: Omit<LeaderboardEntry, 'position'>
  isCurrentPlayer: boolean
}>()

const lobbyStore = useLobbyStore()

function getUsername(id: string): string {
  const user = lobbyStore.users.find((u) => u.id === id)
  return user?.username || 'Unknown Player'
}

function formatMoney(amount: number): string {
  return `$${amount.toLocaleString()}`
}
</script>

<style scoped>
.removed-player {
  display: grid;
  grid-template-columns: 2fr 3fr 1fr;
  padding: 0.75rem;
  border-bottom: 1px solid var(--color-border);
  align-items: center;
  opacity: 0.7;
}

.removed-player:last-child {
  border-bottom: none;
}

.current-player {
  background-color: rgba(var(--color-primary-rgb), 0.1);
  border-radius: 4px;
}

.player {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.username {
  font-weight: 500;
}

.money {
  font-weight: bold;
  color: var(--color-text-light);
}
</style>
