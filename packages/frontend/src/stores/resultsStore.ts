import type { EndAuctionEvent } from '@auction/common'
import type { Player } from '@/stores/lobbyStore.ts'
import { defineStore } from 'pinia'

export type Leaderboard = EndAuctionEvent['leaderboard']

export const useResultsStore = defineStore('results', {
  state: () => ({
    leaderboard: null as Leaderboard | null,
    users: [] as Player[],
  }),
  actions: {
    setLeaderboard(leaderboard: Leaderboard, users: Player[]) {
      this.leaderboard = leaderboard
      this.users = users
    },
    clearLeaderboard() {
      this.leaderboard = null
      this.users = []
    },
  },
  persist: true,
})
