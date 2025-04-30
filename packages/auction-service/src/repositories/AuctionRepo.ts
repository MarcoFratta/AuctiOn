import { AuctionInfo } from '../schemas/Auction'

export interface AuctionRepo {
  saveAuction(auction: AuctionInfo): Promise<void>

  getAuction(auctionId: string): Promise<AuctionInfo | null>
  getAuctions(): Promise<AuctionInfo[]>
  deleteAuction(auctionId: string): Promise<void>
}
