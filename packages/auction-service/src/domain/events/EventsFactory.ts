import { validateSchema } from '@auction/common/validation'
import { AuctionInfo } from '../../schemas/Auction'
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
  PlayerUpdateEvent,
  playerUpdateEventSchema,
  SaleEvent,
  saleEventSchema,
  TimerStartEvent,
  timerStartSchema,
} from '@auction/common/events/auction'
import * as lobbyEvents from '@auction/common/events/lobby'
import { toInventory } from '../../converters/AuctionConverter'
import { Player, PlayerInfo } from '../../schemas/Player'

export const saleEvent = (auction: AuctionInfo): SaleEvent => {
  return validateSchema(saleEventSchema, {
    type: 'sale',
    auctionId: auction.id,
    playerId: auction.currentSale!.sellerId,
    timestamp: new Date().toISOString(),
    sale: toInventory.convert(auction.currentSale!.items),
  })
}

export const bidEvent = (auction: AuctionInfo): BidEvent => {
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

export const roundEndEvent = (auctionId: AuctionInfo['id']): EndRoundEvent => {
  return validateSchema(endRoundEventSchema, {
    type: 'end-round',
    auctionId: auctionId,
    timestamp: new Date().toISOString(),
  })
}
export const auctionEndEvent = (auctionId: AuctionInfo['id'], leaderboard: Leaderboard): EndAuctionEvent => {
  return validateSchema(endAuctionEventSchema, {
    type: 'end-auction',
    auctionId: auctionId,
    leaderboard: leaderboard,
    timestamp: new Date().toISOString(),
  })
}
export const playerConnectedEvent = (auctionId: AuctionInfo['id'], playerId: string): PlayerConnectedEvent => {
  return validateSchema(playerConnectedEventSchema, {
    type: 'player-connected',
    auctionId: auctionId,
    playerId: playerId,
    timestamp: new Date().toISOString(),
  })
}
export const playerDisconnectedEvent = (auctionId: AuctionInfo['id'], playerId: Player['id']): PlayerDisconnectedEvent => {
  return validateSchema(playerDisconnectedEventSchema, {
    type: 'player-disconnected',
    auctionId: auctionId,
    playerId: playerId,
    timestamp: new Date().toISOString(),
  })
}
export const playerJoinEvent = (
  auctionId: AuctionInfo['id'],
  playerId: Player['id'],
  playerInfo: PlayerInfo
): lobbyEvents.LobbyJoinedEvent => {
  return validateSchema(lobbyEvents.lobbyJoinedEventSchema, {
    type: 'lobby-joined',
    lobbyId: auctionId,
    playerId: playerId,
    timestamp: new Date().toISOString(),
    username: playerInfo.username,
  })
}
export const playerLeaveEvent = (auctionId: AuctionInfo['id'], playerId: Player['id']): lobbyEvents.LobbyLeftEvent => {
  return validateSchema(lobbyEvents.lobbyLeftEventSchema, {
    type: 'lobby-left',
    lobbyId: auctionId,
    playerId: playerId,
  })
}
export const auctionDeletedEvent = (auctionId: AuctionInfo['id']): lobbyEvents.LobbyDeletedEvent => {
  return validateSchema(lobbyEvents.lobbyDeletedEventSchema, {
    type: 'lobby-deleted',
    lobbyId: auctionId,
  })
}
export const auctionStartEvent = (auctionId: AuctionInfo['id']): lobbyEvents.LobbyStartedEvent => {
  return validateSchema(lobbyEvents.lobbyStartedEventSchema, {
    type: 'lobby-started',
    lobbyId: auctionId,
  })
}
export const auctionCreatedEvent = (auctionId: AuctionInfo['id']): lobbyEvents.LobbyCreatedEvent => {
  return validateSchema(lobbyEvents.lobbyCreatedEventSchema, {
    type: 'lobby-created',
    lobbyId: auctionId,
  })
}
export const playerLobbyInfoEvent = (playerId: Player['id'], playerInfo: PlayerInfo): PlayerUpdateEvent => {
  return validateSchema(playerUpdateEventSchema, {
    type: 'player-update',
    playerId: playerId,
    status: playerInfo.status,
    username: playerInfo.username,
  })
}
export const timerStartEvent = (auctionId: string, startTime: number): TimerStartEvent => {
  return validateSchema(timerStartSchema, {
    type: 'timer-start',
    timer: startTime,
    auctionId: auctionId,
  })
}
