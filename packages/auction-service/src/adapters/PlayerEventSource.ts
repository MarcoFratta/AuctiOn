export interface PlayerEventSource {
  broadcast(message: string): void

  onPlayerConnect(callback: (playerId: string) => void): void

  onPlayerMessage(callback: (playerId: string, message: string) => void): void

  onPlayerDisconnect(callback: (playerId: string) => void): void
}
