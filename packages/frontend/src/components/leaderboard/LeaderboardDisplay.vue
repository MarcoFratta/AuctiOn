<template>
  <BaseCard class="w-full">
    <Title class="text-xl md:text-2xl">Final Rankings</Title>
    <div v-if="leaderboard" class="w-full">
      <!-- Leaderboard Entries -->
      <div class="space-y-2.5">
        <LeaderboardEntry
          v-for="entry in leaderboard.leaderboard"
          :key="entry.id"
          :entry="entry"
          :is-current-player="entry.id === currentPlayerId"
          :is-removed="false"
        />
      </div>

      <!-- Eliminated Players Section -->
      <div
        v-if="leaderboard.removed.length > 0"
        class="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700"
      >
        <div class="flex items-center mb-4">
          <Title class="text-xl md:text-2xl"> Eliminated Players </Title>
        </div>
        <div class="space-y-2.5">
          <LeaderboardEntry
            v-for="player in leaderboard.removed"
            :key="player.id"
            :entry="player"
            :is-current-player="player.id === currentPlayerId"
            :is-removed="true"
          />
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-else>
      <LobbyLoading
        message="Please wait while we calculate the final standings."
        tipText="The auction has ended and the final results are being prepared."
        tipTitle="Game Complete"
        title="Loading Results"
      />
    </div>
  </BaseCard>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { useUserStore } from '@/stores/userStore'
import LeaderboardEntry from './LeaderboardEntry.vue'
import BaseCard from '@/components/common/BaseCard.vue'
import Title from '@/components/common/Title.vue'
import LobbyLoading from '@/components/lobby/LobbyLoading.vue'
import { useResultsStore } from '@/stores/resultsStore.ts'

const userStore = useUserStore()
const resultsStore = useResultsStore()
const leaderboard = computed(() => resultsStore.leaderboard)
const currentPlayerId = computed(() => userStore.user?.id)
</script>

<style scoped>
/* Clean up unused styles */
</style>
