export interface PlayerChannel {
  sendToPlayer(playerId: string, message: string): void

  broadcast(message: string, predicate: (id: string) => boolean): void
}
