import {
  AuctionDeletedMsg,
  auctionDeletedMsgSchema,
  AuctionEndMsg,
  auctionEndMsgSchema,
  AuctionMsg,
  auctionMsgSchema,
  BidUpdateMsg,
  bidUpdateMsgSchema,
  ErrorMsg,
  errorMsgSchema,
  PlayerConnectedMsg,
  playerConnectedMsgSchema,
  PlayerDisconnectedMsg,
  playerDisconnectedMsgSchema,
  playerInfoSchema,
  RoundEndMsg,
  roundEndMsgSchema,
  SaleUpdateMsg,
  saleUpdateMsgSchema,
  TimerStartMsg,
  timerStartMsgSchema,
} from '@auction/common/messages'
import { validateSchema } from '@auction/common/validation'
import { Bid } from '../../schemas/Bid'
import { Sale } from '../../schemas/Sale'
import { saleWeight, toInventory } from '../../converters/AuctionConverter'
import { Auction } from '../../schemas/Auction'
import { Player } from '../../schemas/Player'
import { Leaderboard } from '../../schemas/Leaderboard'
import logger from '@auction/common/logger'

const toPlayerInfo = (player: Player) => {
  return validateSchema(playerInfoSchema, {
    inventory: toInventory.convert(player.inventory),
    money: player.money,
  })
}

export const auctionMessage = (auction: Auction, playerId: string): AuctionMsg => {
  const player: Player = auction.players.find(p => p.id === playerId)!
  return validateSchema(auctionMsgSchema, {
    type: 'auction',
    auction: auction,
    playerInfo: toPlayerInfo(player),
  })
}

export const errorMessage = (msg: string): ErrorMsg => {
  return validateSchema(errorMsgSchema, {
    type: 'error',
    message: msg,
  })
}
export const bidUpdateMessage = (bid: Bid): BidUpdateMsg => {
  return validateSchema(bidUpdateMsgSchema, {
    type: 'new-bid',
    bid,
  })
}
export const saleUpdateMessage = (sale: Sale): SaleUpdateMsg => {
  return validateSchema(saleUpdateMsgSchema, {
    type: 'new-sale',
    sale: {
      weight: saleWeight.convert(sale),
    },
  })
}
export const playerConnectedMessage = (playerId: string): PlayerConnectedMsg => {
  return validateSchema(playerConnectedMsgSchema, {
    type: 'player-connected',
    playerId,
  })
}
export const playerDisconnectedMessage = (playerId: string): PlayerDisconnectedMsg => {
  return validateSchema(playerDisconnectedMsgSchema, {
    type: 'player-disconnected',
    playerId,
  })
}

export const roundEndMessage = (auction: Auction, playerId: string): RoundEndMsg => {
  const player: Player = auction.players.find(p => p.id === playerId)!
  return validateSchema(roundEndMsgSchema, {
    type: 'round-end',
    nextRound: auction.currentRound,
    playerInfo: toPlayerInfo(player),
  })
}
export const auctionEndMessage = (leaderboard: Leaderboard): AuctionEndMsg => {
  try {
    return validateSchema(auctionEndMsgSchema, {
      type: 'auction-end',
      leaderboard: leaderboard,
    })
  } catch (e) {
    logger.error(`Error creating auction end message: ${e}`)
    throw e
  }
}
export const auctionDeletedMessage = (): AuctionDeletedMsg => {
  return validateSchema(auctionDeletedMsgSchema, {
    type: 'auction-deleted',
  })
}
export const timerStartMessage = (time: number): TimerStartMsg => {
  return validateSchema(timerStartMsgSchema, {
    type: 'timer-start',
    time: new Date(time).toISOString(),
  })
}
