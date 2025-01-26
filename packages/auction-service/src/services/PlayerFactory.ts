import { validateSchema } from '../utils/Validator'
import { PlayerSchema } from '../schemas/Player'
import { AuctionConfig } from '../schemas/Auction'
import { toInventoryMap } from '../converters/AuctionConverter'

export const createPlayer = (id: string, auction: AuctionConfig) => {
  return validateSchema(PlayerSchema, {
    id,
    money: auction.startAmount,
    inventory: toInventoryMap.convert(auction.startInventory),
    status: 'not-connected',
  })
}
