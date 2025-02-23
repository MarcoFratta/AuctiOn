import { AuctionMessage } from '@auction/common/messages'

export interface PlayerEventSource {
  onPlayerConnect(callback: (playerId: string) => void): void

  onPlayerMessage(callback: (playerId: string, message: AuctionMessage) => void): void

  onPlayerDisconnect(callback: (playerId: string) => void): void
}
