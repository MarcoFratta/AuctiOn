import { Converter } from './Converter'
import { Auction } from '../schemas/Auction'
import {
  BidEvent,
  BidEventSchema,
  EndAuctionEvent,
  EndAuctionEventSchema,
  EndRoundEvent,
  EndRoundEventSchema,
  PlayerConnectedEvent,
  PlayerConnectedEventSchema,
  PlayerDisconnectedEvent,
  PlayerDisconnectedEventSchema,
  SaleEvent,
  SaleEventSchema,
} from '../schemas/AuctionEvents'
import { validateSchema } from '../utils/Validator'
import { toInventory } from './AuctionConverter'

export const toSaleEvent: Converter<Auction, SaleEvent> = {
  convert: (auction: Auction): SaleEvent => {
    return validateSchema(SaleEventSchema, {
      type: 'player-sale',
      auctionId: auction.id,
      playerId: auction.currentSale!.sellerId,
      timestamp: new Date().toISOString(),
      sale: toInventory.convert(auction.currentSale!.items),
    })
  },
}

export const toBidEvent: Converter<Auction, BidEvent> = {
  convert: (auction: Auction): BidEvent => {
    return validateSchema(BidEventSchema, {
      type: 'player-bid',
      auctionId: auction.id,
      playerId: auction.currentBid!.playerId,
      timestamp: new Date().toISOString(),
      bid: {
        amount: auction.currentBid!.amount,
        round: auction.currentBid!.round,
      },
    })
  },
}

export const toRoundEndEvent: Converter<Auction, EndRoundEvent> = {
  convert: (auction: Auction): EndRoundEvent => {
    return validateSchema(EndRoundEventSchema, {
      type: 'end-round',
      auctionId: auction.id,
      timestamp: new Date().toISOString(),
    })
  },
}
export const toAuctionEndEvent: Converter<Auction, EndAuctionEvent> = {
  convert: (auction: Auction): EndAuctionEvent => {
    return validateSchema(EndAuctionEventSchema, {
      type: 'end-auction',
      auctionId: auction.id,
      timestamp: new Date().toISOString(),
    })
  },
}

export const toPlayerConnectedEvent = (id: string): Converter<Auction, PlayerConnectedEvent> => {
  return {
    convert: (auction: Auction): PlayerConnectedEvent => {
      return validateSchema(PlayerConnectedEventSchema, {
        type: 'player-connected',
        auctionId: auction.id,
        playerId: id,
        timestamp: new Date().toISOString(),
      })
    },
  }
}
export const toPlayerDisconnectedEvent = (id: string): Converter<Auction, PlayerDisconnectedEvent> => {
  return {
    convert: (auction: Auction): PlayerDisconnectedEvent => {
      return validateSchema(PlayerDisconnectedEventSchema, {
        type: 'player-disconnected',
        auctionId: auction.id,
        playerId: id,
        timestamp: new Date().toISOString(),
      })
    },
  }
}
