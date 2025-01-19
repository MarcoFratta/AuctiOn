import { Auction } from '../schemas/Auction'

export interface AuctionEvents {
  onRoundEnd(callback: (auction: Auction) => void): void
  onAuctionEnd(callback: (auction: Auction) => void): void
}
