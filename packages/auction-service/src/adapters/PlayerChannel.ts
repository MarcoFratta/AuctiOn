import { AuctionMessage } from '@auction/common/messages'

export interface PlayerChannel {
  sendToPlayer(playerId: string, message: AuctionMessage): void

  broadcast(producer: (id: string) => AuctionMessage, predicate?: (id: string) => boolean): void

  closeConnection(playerId: string, normal: boolean, reason: string): void
}
