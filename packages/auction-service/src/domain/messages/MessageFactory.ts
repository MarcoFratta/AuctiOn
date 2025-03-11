import {
  AuctionDeletedMsg,
  auctionDeletedMsgSchema,
  AuctionEndMsg,
  auctionEndMsgSchema,
  AuctionMsg,
  auctionMsgSchema,
  AuctionStartMsg,
  auctionStartMsgSchema,
  BidUpdateMsg,
  bidUpdateMsgSchema,
  ErrorMsg,
  errorMsgSchema,
  PlayerConnectedMsg,
  playerConnectedMsgSchema,
  PlayerDisconnectedMsg,
  playerDisconnectedMsgSchema,
  PlayerInfoMsg,
  playerInfoMsgSchema,
  playerInfoSchema,
  PlayerJoinMsg,
  playerJoinSchema,
  PlayerLeaveMsg,
  playerLeaveSchema,
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
import { AuctionInfo } from '../../schemas/Auction'
import { Player, PlayerInfo } from '../../schemas/Player'
import { Leaderboard } from '../../schemas/Leaderboard'
import logger from '@auction/common/logger'

const toPlayerInfo = (player: Player) => {
  return validateSchema(playerInfoSchema, {
    inventory: toInventory.convert(player.inventory),
    money: player.money,
  })
}

export const auctionMessage = (auction: AuctionInfo, playerId: string): AuctionMsg => {
  const player: Player = auction.players.find(p => p.id === playerId)!
  return validateSchema(auctionMsgSchema, {
    type: 'auction',
    auction: {
      ...auction,
      currentSale: auction.currentSale ? saleUpdateMessage(auction.currentSale).sale : undefined,
    },
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
      info: {
        weight: saleWeight.convert(sale),
      },
      sellerId: sale.sellerId,
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

export const roundEndMessage = (auction: AuctionInfo, playerId: string): RoundEndMsg => {
  return validateSchema(roundEndMsgSchema, {
    ...auctionMessage(auction, playerId),
    type: 'round-end',
  })
}
export const auctionStartMessage = (auction: AuctionInfo, playerId: string): AuctionStartMsg => {
  return validateSchema(auctionStartMsgSchema, {
    ...auctionMessage(auction, playerId),
    type: 'auction-start',
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
export const playerLeaveMessage = (playerId: string): PlayerLeaveMsg => {
  return validateSchema(playerLeaveSchema, {
    type: 'player-leave',
    playerId,
  })
}
export const playerJoinMessage = (playerId: string, info: PlayerInfo): PlayerJoinMsg => {
  return validateSchema(playerJoinSchema, {
    type: 'player-join',
    playerId,
    username: info.username,
  })
}
export const playerInfoMessage = (playerId: string, info: PlayerInfo): PlayerInfoMsg => {
  return validateSchema(playerInfoMsgSchema, {
    type: 'player-info',
    playerId,
    playerInfo: info,
  })
}
