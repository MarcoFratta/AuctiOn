<template>
  <div class="bg-gray-800 w-full p-3 sm:p-4 lg:p-6 rounded-lg shadow-lg">
    <div class="flex items-center justify-between mb-4">
      <h2 class="text-xl font-bold text-white">🏆 Leaderboard</h2>
    </div>

    <div v-if="leaderboard" class="w-full">
      <!-- Header -->
      <div
        class="grid grid-cols-12 gap-2 p-2 mb-2 bg-gray-700 rounded-md text-gray-400 font-medium text-sm hidden sm:grid"
      >
        <div class="col-span-1 text-center">Rank</div>
        <div class="col-span-4">Player</div>
        <div class="col-span-5">Inventory</div>
        <div class="col-span-2 text-right">Money</div>
      </div>

      <!-- Leaderboard Entries -->
      <div class="space-y-2">
        <LeaderboardEntry
          v-for="entry in leaderboard.leaderboard"
          :key="entry.id"
          :entry="entry"
          :is-current-player="entry.id === currentPlayerId"
        />
      </div>

      <!-- Eliminated Players Section -->
      <div v-if="leaderboard.removed.length > 0" class="mt-6 pt-4 border-t border-gray-700">
        <h3 class="text-lg font-medium text-gray-400 mb-3">Eliminated Players</h3>
        <div class="space-y-2">
          <RemovedPlayerEntry
            v-for="player in leaderboard.removed"
            :key="player.id"
            :is-current-player="player.id === currentPlayerId"
            :player="player"
          />
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-else class="w-full p-8 text-center text-gray-400">Loading leaderboard...</div>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { useLobbyStore } from '@/stores/lobbyStore'
import { useUserStore } from '@/stores/userStore'
import LeaderboardEntry from './LeaderboardEntry.vue'
import RemovedPlayerEntry from './RemovedPlayerEntry.vue'

const lobbyStore = useLobbyStore()
const userStore = useUserStore()

const leaderboard = computed(() => lobbyStore.leaderboard)
const currentPlayerId = computed(() => userStore.user?.id)
</script>

<style scoped>
.leaderboard-container {
  background-color: var(--color-background-soft);
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.leaderboard {
  width: 100%;
}

.leaderboard-header {
  display: grid;
  grid-template-columns: 80px 2fr 3fr 1fr;
  padding: 1rem;
  font-weight: bold;
  border-bottom: 2px solid var(--color-border);
  margin-bottom: 0.5rem;
}

.removed-players-section {
  margin-top: 2rem;
  padding-top: 1rem;
  border-top: 1px solid var(--color-border);
}

.removed-players-section h3 {
  margin-bottom: 1rem;
  color: var(--color-text-light);
}

.loading {
  text-align: center;
  padding: 2rem;
  color: var(--color-text-light);
}
</style>
