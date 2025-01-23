import { Auction } from '../schemas/Auction'

export interface AuctionEventsSource {
  onRoundEnd(callback: (auction: Auction) => void): void
  onAuctionEnd(callback: (auction: Auction) => void): void

  onNewSale(callback: (auction: Auction) => void): void

  onNewBid(callback: (auction: Auction) => void): void
}
