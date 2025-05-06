import { defineStore } from 'pinia'
import { z } from 'zod'
import type { AuctionMsg } from '@auction/common'
import { useUserStore } from '@/stores/userStore.ts'
import { shapeIcons, type ShapeType } from '@/icons/shapes.ts'

export const playerSchema = z.object({
  id: z.string(),
  username: z.string(),
  status: z.string(),
  connected: z.boolean(),
})
export type Player = z.infer<typeof playerSchema>
export type Lobby = AuctionMsg['auction']
interface LobbyState {
  lobby: Lobby | undefined
  users: Player[]
  collectionSize: number
  playerInfo: AuctionMsg['playerInfo'] | undefined
  timerStart: Date | undefined
  serverTimeOffset: number
}

export const useLobbyStore = defineStore('lobby', {
  state: (): LobbyState => ({
    lobby: undefined,
    users: [],
    collectionSize: 3,
    playerInfo: undefined,
    timerStart: undefined,
    serverTimeOffset: 0,
  }),
  getters: {
    weights() {
      return [
        { item: 'square' as ShapeType, weight: 1, svg: shapeIcons.square, color: 'fill-red-500' },
        { item: 'circle' as ShapeType, weight: 3, svg: shapeIcons.circle, color: 'fill-blue-500' },
        {
          item: 'triangle' as ShapeType,
          weight: 5,
          svg: shapeIcons.triangle,
          color: 'fill-green-500',
        },
      ]
    },
    auctionEndTime(state): number | null {
      if (!state.timerStart || !state.lobby?.bidTime) {
        return null
      }
      const timerStartTime = state.timerStart.getTime()
      const bidTimeMs = state.lobby.bidTime * 1000
      return timerStartTime + bidTimeMs
    },
    currentUser(state) {
      const userId = useUserStore().user?.id
      return state.users.find((u: Player) => u.id === userId)
    },
    userIsTheSeller(state): boolean {
      return this.currentUser?.id === state.lobby?.sellerQueue[this.sellerIndex]
    },
    sellerIndex(state): number {
      if (state.lobby) {
        return (state.lobby.currentRound - 1) % (state.lobby.sellerQueue?.length ?? 1)
      }
      return 0
    },
  },
  actions: {
    setLobby(lobby: Lobby) {
      this.lobby = lobby
    },
    setSale(sale: Lobby['currentSale']) {
      if (!this.lobby) return
      this.lobby!.currentSale = sale
    },
    setBid(bid: Lobby['currentBid']) {
      if (bid && bid.round == this.lobby?.currentRound) {
        this.lobby!.currentBid = bid
      }
    },
    clearLobby() {
      this.lobby = undefined
      this.users = []
      this.playerInfo = undefined
    },
    addUser(user: Player) {
      this.users.push(user)
    },
    getUser(id: Player['id']) {
      return this.users.find((u) => u.id === id)
    },
    updateUser(id: Player['id'], update: Partial<Player>) {
      const user = this.users.find((u) => u.id === id)
      if (!user) return
      Object.assign(user, update)
    },
    removeUser(id: Player['id']) {
      if (!this.lobby?.currentSale && this.lobby?.sellerQueue[this.sellerIndex] === id) {
        const us = this.users.find((u) => u.id === id)
        if (!us) return
        us.connected = false
        return
      }
      this.users = this.users.filter((u) => u.id !== id)
    },
    setPlayerInfo(playerInfo: AuctionMsg['playerInfo']) {
      this.playerInfo = playerInfo
    },
    clearPlayerInfo() {
      this.playerInfo = undefined
    },
    updateTimer(date: Date) {
      this.timerStart = date
      console.log('[LobbyStore] Timer start updated:', this.timerStart)
    },
    setTimeOffset(offset: number) {
      this.serverTimeOffset = offset
    },
    resetTimer() {
      this.timerStart = undefined
    },
  },
})
