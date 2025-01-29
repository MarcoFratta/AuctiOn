import { Auction } from '../schemas/Auction'

export interface AuctionRepo {
  saveAuction(auction: Auction): Promise<void>

  getAuctions(): Promise<Auction[]>

  deleteAuction(auctionId: string): Promise<void>
}
