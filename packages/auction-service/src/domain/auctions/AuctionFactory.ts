import { AuctionConfig, AuctionInfo } from '../../schemas/Auction'
import { Auction, AuctionImpl } from './Auction'

export const createAuctionFromConfig = (config: AuctionConfig): Auction => {
  return new AuctionImpl({
    ...config,
    currentRound: 1,
    players: [],
    sellerQueue: [],
    currentSale: undefined,
    currentBid: undefined,
  })
}

export const createFromInfo = (info: AuctionInfo): Auction => {
  return new AuctionImpl(info)
}
