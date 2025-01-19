export interface PlayerChannel {
  sendToPlayer(playerId: string, message: string): void

  broadcast(producer: (id: string) => string, predicate?: (id: string) => boolean): void
}
