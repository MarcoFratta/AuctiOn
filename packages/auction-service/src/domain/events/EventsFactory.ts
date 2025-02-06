import { validateSchema } from '@auction/common/validation'
import { Auction } from '../../schemas/Auction'
import { Leaderboard } from '../../schemas/Leaderboard'
import {
  BidEvent,
  bidEventSchema,
  EndAuctionEvent,
  endAuctionEventSchema,
  EndRoundEvent,
  endRoundEventSchema,
  PlayerConnectedEvent,
  playerConnectedEventSchema,
  PlayerDisconnectedEvent,
  playerDisconnectedEventSchema,
  SaleEvent,
  saleEventSchema,
} from '@auction/common/events/auction'
import { toInventory } from '../../converters/AuctionConverter'
import { Player } from '../../schemas/Player'

export const saleEvent = (auction: Auction): SaleEvent => {
  return validateSchema(saleEventSchema, {
    type: 'sale',
    auctionId: auction.id,
    playerId: auction.currentSale!.sellerId,
    timestamp: new Date().toISOString(),
    sale: toInventory.convert(auction.currentSale!.items),
  })
}

export const bidEvent = (auction: Auction): BidEvent => {
  return validateSchema(bidEventSchema, {
    type: 'bid',
    auctionId: auction.id,
    playerId: auction.currentBid!.playerId,
    timestamp: new Date().toISOString(),
    bid: {
      amount: auction.currentBid!.amount,
      round: auction.currentBid!.round,
    },
  })
}

export const roundEndEvent = (auctionId: Auction['id']): EndRoundEvent => {
  return validateSchema(endRoundEventSchema, {
    type: 'end-round',
    auctionId: auctionId,
    timestamp: new Date().toISOString(),
  })
}
export const auctionEndEvent = (auctionId: Auction['id'], leaderboard: Leaderboard): EndAuctionEvent => {
  return validateSchema(endAuctionEventSchema, {
    type: 'end-auction',
    auctionId: auctionId,
    leaderboard: leaderboard,
    timestamp: new Date().toISOString(),
  })
}
export const playerConnectedEvent = (auctionId: Auction['id'], playerId: string): PlayerConnectedEvent => {
  return validateSchema(playerConnectedEventSchema, {
    type: 'player-connected',
    auctionId: auctionId,
    playerId: playerId,
    timestamp: new Date().toISOString(),
  })
}
export const playerDisconnectedEvent = (auctionId: Auction['id'], playerId: Player['id']): PlayerDisconnectedEvent => {
  return validateSchema(playerDisconnectedEventSchema, {
    type: 'player-disconnected',
    auctionId: auctionId,
    playerId: playerId,
    timestamp: new Date().toISOString(),
  })
}
