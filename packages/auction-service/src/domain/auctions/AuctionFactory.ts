import { validateSchema } from '@auction/common/validation'
import { Auction, AuctionConfig, AuctionSchema } from '../../schemas/Auction'

export const createAuctionFromConfig = (config: AuctionConfig): Auction => {
  const auction: Auction = {
    id: config.id,
    players: [],
    maxRound: config.maxRound,
    maxPlayers: config.maxPlayers,
    startAmount: config.startAmount,
    startInventory: config.startInventory,
    bidTime: config.bidTime,
    sellerQueue: [],
    currentRound: 1,
    startTimestamp: undefined,
  }
  return validateSchema(AuctionSchema, auction)
}
