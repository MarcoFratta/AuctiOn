import { defineStore } from 'pinia'
import { z } from 'zod'
import type { AuctionMsg } from '@auction/common'

export const playerSchema = z.object({
  id: z.string(),
  username: z.string(),
  status: z.string(),
  connected: z.boolean(),
})
export type Player = z.infer<typeof playerSchema>
export type Lobby = AuctionMsg['auction']
export const useLobbyStore = defineStore('lobby', {
  state: () => ({
    lobby: undefined as Lobby | undefined,
    users: [] as Player[],
  }),
  actions: {
    setLobby(lobby: Lobby) {
      this.lobby = lobby
    },
    clearLobby() {
      this.lobby = undefined
      this.users = []
    },
    addUser(user: Player) {
      this.users.push(user)
    },
    updateUser(id: Player['id'], update: Partial<Player>) {
      const user = this.users.find((u) => u.id === id)
      if (!user) return
      Object.assign(user, update)
    },
    removeUser(id: Player['id']) {
      this.users = this.users.filter((u) => u.id !== id)
    },
  },
})
