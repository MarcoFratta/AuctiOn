import type { EndAuctionEvent } from '@auction/common'
import type { Player } from '@/stores/lobbyStore.ts'
import { defineStore } from 'pinia'

export type Leaderboard = EndAuctionEvent['leaderboard']

export const useResultsStore = defineStore('results', {
  state: () => ({
    leaderboard: null as Leaderboard | null,
    users: [] as Player[],
    auctionId: '' as string,
  }),
  actions: {
    setLeaderboard(leaderboard: Leaderboard, users: Player[], id: string) {
      this.leaderboard = leaderboard
      this.users = users
      this.auctionId = id
    },
    clearLeaderboard() {
      this.leaderboard = null
      this.users = []
      this.auctionId = ''
    },
  },
  persist: true,
})
