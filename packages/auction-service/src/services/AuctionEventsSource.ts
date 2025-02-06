import { Auction } from '../schemas/Auction'
import { Leaderboard } from '../schemas/Leaderboard'

export interface AuctionEventsSource {
  onRoundEnd(callback: (auction: Auction) => void): void

  onAuctionEnd(callback: (auction: Leaderboard, auctionId: string) => void): void
  onAuctionDeleted(callback: (auction: Auction) => void): void
  onNewSale(callback: (auction: Auction) => void): void
  onNewBid(callback: (auction: Auction) => void): void
  onPlayerJoin(callback: (id: string) => void): void
  onPlayerLeave(callback: (id: string) => void): void
}
