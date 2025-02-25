import { Leaderboard } from '../schemas/Leaderboard'
import { AuctionInfo } from '../schemas/Auction'

export interface AuctionEventsSource {
  onRoundEnd(callback: (auction: AuctionInfo) => void): void
  onAuctionEnd(callback: (auction: Leaderboard, auctionId: string) => void): void
  onAuctionDeleted(callback: (auction: AuctionInfo) => void): void
  onNewSale(callback: (auction: AuctionInfo) => void): void
  onNewBid(callback: (auction: AuctionInfo) => void): void

  onPlayerJoin(callback: (auctionId: string, playerId: string) => void): void

  onPlayerLeave(callback: (auctionId: string, playerId: string) => void): void
}
