<template>
  <div class="auction-end-container">
    <h1 class="title">Auction Ended</h1>
    <p class="subtitle">Final Results</p>

    <LeaderboardDisplay />

    <div class="actions">
      <button class="btn btn-primary" @click="backToLobby">Back to Lobby</button>
      <button class="btn btn-secondary" @click="exitAuction">Exit</button>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { useRouter } from 'vue-router'
import LeaderboardDisplay from '@/components/leaderboard/LeaderboardDisplay.vue'
import { useSocketStore } from '@/stores/socketStore'

const router = useRouter()
const socketStore = useSocketStore()

function backToLobby() {
  // Send a message to the server to go back to the lobby if needed
  router.push('/lobby')
}

function exitAuction() {
  socketStore.disconnect()
  router.push('/')
}
</script>

<style scoped>
.auction-end-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  text-align: center;
}

.title {
  font-size: 2.5rem;
  margin-bottom: 0.5rem;
  color: var(--color-heading);
}

.subtitle {
  font-size: 1.5rem;
  margin-bottom: 2rem;
  color: var(--color-text-light);
}

.actions {
  margin-top: 2rem;
  display: flex;
  justify-content: center;
  gap: 1rem;
}

.btn {
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.3s;
}

.btn-primary {
  background-color: var(--color-primary);
  color: white;
  border: none;
}

.btn-secondary {
  background-color: var(--color-background-soft);
  color: var(--color-text);
  border: 1px solid var(--color-border);
}

.btn:hover {
  opacity: 0.9;
}
</style>
