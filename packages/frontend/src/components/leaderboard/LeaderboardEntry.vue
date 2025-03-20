<template>
  <div
    :class="[
      isCurrentPlayer ? 'bg-blue-900 bg-opacity-30' : 'bg-gray-700',
      'hover:bg-gray-600 transition-colors',
    ]"
    class="grid grid-cols-12 gap-2 p-3 rounded-md items-center"
  >
    <!-- Rank - Mobile: Hidden, Desktop: Visible -->
    <div class="col-span-1 hidden sm:flex justify-center">
      <div
        :class="positionClass"
        class="w-8 h-8 flex items-center justify-center rounded-full text-sm font-bold"
      >
        {{ entry.position }}
      </div>
    </div>

    <!-- Player - Mobile: 4 cols, Desktop: 4 cols -->
    <div class="col-span-4 sm:col-span-4 flex items-center gap-2">
      <!-- Mobile Rank Badge -->
      <div
        :class="positionClass"
        class="w-6 h-6 sm:hidden flex items-center justify-center rounded-full text-xs font-bold mr-1"
      >
        {{ entry.position }}
      </div>

      <UserAvatar :user-id="entry.id" size="small" />
      <span class="text-white font-medium text-sm truncate">{{ getUsername(entry.id) }}</span>
    </div>

    <!-- Inventory - Mobile: 5 cols, Desktop: 5 cols -->
    <div class="col-span-5 sm:col-span-5">
      <InventoryDisplay :inventory="entry.inventory" compact />
    </div>

    <!-- Money - Mobile: 3 cols, Desktop: 2 cols -->
    <div class="col-span-3 sm:col-span-2 text-right text-green-400 font-bold">
      {{ formatMoney(entry.money) }}
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import type { LeaderboardEntry as LeaderboardEntryType } from '@auction/common'
import { useLobbyStore } from '@/stores/lobbyStore'
import UserAvatar from '@/components/user/UserAvatar.vue'
import InventoryDisplay from '@/components/inventory/InventoryDisplay.vue'

const props = defineProps<{
  entry: LeaderboardEntryType
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

const positionClass = computed(() => {
  if (props.entry.position === 1) return 'bg-yellow-500 text-gray-900'
  if (props.entry.position === 2) return 'bg-gray-300 text-gray-900'
  if (props.entry.position === 3) return 'bg-amber-700 text-white'
  return 'bg-gray-600 text-white'
})
</script>

<style scoped>
.leaderboard-entry {
  display: grid;
  grid-template-columns: 80px 2fr 3fr 1fr;
  padding: 1rem;
  border-bottom: 1px solid var(--color-border-hover);
  align-items: center;
}

.leaderboard-entry:last-child {
  border-bottom: none;
}

.current-player {
  background-color: rgba(var(--color-primary-rgb), 0.1);
  border-radius: 4px;
}

.rank {
  display: flex;
  justify-content: center;
  align-items: center;
}

.position {
  width: 36px;
  height: 36px;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 50%;
  font-weight: bold;
  background-color: var(--color-background-mute);
}

.first {
  background-color: gold;
  color: #333;
}

.second {
  background-color: silver;
  color: #333;
}

.third {
  background-color: #cd7f32; /* bronze */
  color: white;
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
  color: var(--color-success);
}
</style>
