import { defineStore } from 'pinia'

export const useLobbyStore = defineStore('lobby', {
  state: () => ({
    lobby: undefined as any,
    users: [] as any[],
  }),
  actions: {
    setLobby(lobby: any) {
      this.lobby = lobby
    },
    clearLobby() {
      this.lobby = undefined
      this.users = []
    },
    addUser(user: any) {
      this.users.push(user)
    },
    removeUser(user: any) {
      this.users = this.users.filter((u) => u.id !== user.id)
    },
  },
})
