import { AuctionInfo } from '../schemas/Auction'

export interface AuctionRepo {
  saveAuction(auction: AuctionInfo): Promise<void>

  getAuctions(): Promise<AuctionInfo[]>

  deleteAuction(auctionId: string): Promise<void>
}
