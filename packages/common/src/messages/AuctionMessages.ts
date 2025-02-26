import { z } from '@auction/common/zod'

import { auctionSchema, bidSchema, inventorySchema, leaderboardSchema } from '../events/Auction'

export const playerInfoSchema = z.object({
  money: z.number().min(0),
  inventory: inventorySchema,
})

export const saleInfoSchema = z.object({
  weight: z.number(),
})

// input messages
export const newBidMsgSchema = z.object({
  type: z.literal('bid'),
  bid: bidSchema.omit({ playerId: true, timestamp: true }),
})

export const newSaleMsgSchema = z.object({
  type: z.literal('sell'),
  sale: inventorySchema,
})

// output messages
export const errorMsgSchema = z.object({
  type: z.literal('error'),
  message: z.string(),
})

export const auctionMsgSchema = z.object({
  type: z.literal('auction'),
  auction: auctionSchema.omit({
    players: true,
  }),
  playerInfo: playerInfoSchema,
})

export const bidUpdateMsgSchema = z.object({
  type: z.literal('new-bid'),
  bid: bidSchema,
})
export const saleUpdateMsgSchema = z.object({
  type: z.literal('new-sale'),
  sale: saleInfoSchema,
})
export const playerConnectedMsgSchema = z.object({
  type: z.literal('player-connected'),
  playerId: z.string(),
})
export const playerDisconnectedMsgSchema = z.object({
  type: z.literal('player-disconnected'),
  playerId: z.string(),
})
export const playerJoinSchema = z.object({
  type: z.literal('player-join'),
  playerId: z.string(),
})
export const playerLeaveSchema = z.object({
  type: z.literal('player-leave'),
  playerId: z.string(),
})

export const roundEndMsgSchema = z.object({
  type: z.literal('round-end'),
  nextRound: z.number().min(1),
  playerInfo: playerInfoSchema,
})

export const auctionEndMsgSchema = z.object({
  type: z.literal('auction-end'),
  leaderboard: leaderboardSchema,
})
export const auctionDeletedMsgSchema = z.object({
  type: z.literal('auction-deleted'),
})

export const timerStartMsgSchema = z.object({
  type: z.literal('timer-start'),
  time: z.string().datetime(),
})

export const typedMessageSchema = z.object({
  type: z.enum([
    'error',
    'auction',
    'new-bid',
    'new-sale',
    'player-connected',
    'player-disconnected',
    'round-end',
    'auction-end',
    'auction-deleted',
    'timer-start',
  ]),
})

export const playerActionsTypeSchema = z.enum(['sell', 'bid'])

export type NewBidMsg = z.infer<typeof newBidMsgSchema>
export type NewSaleMsg = z.infer<typeof newSaleMsgSchema>
export type ErrorMsg = z.infer<typeof errorMsgSchema>
export type AuctionMsg = z.infer<typeof auctionMsgSchema>
export type BidUpdateMsg = z.infer<typeof bidUpdateMsgSchema>
export type SaleUpdateMsg = z.infer<typeof saleUpdateMsgSchema>
export type PlayerConnectedMsg = z.infer<typeof playerConnectedMsgSchema>
export type PlayerDisconnectedMsg = z.infer<typeof playerDisconnectedMsgSchema>
export type PlayerJoinMsg = z.infer<typeof playerJoinSchema>
export type PlayerLeaveMsg = z.infer<typeof playerLeaveSchema>
export type RoundEndMsg = z.infer<typeof roundEndMsgSchema>
export type AuctionEndMsg = z.infer<typeof auctionEndMsgSchema>
export type AuctionDeletedMsg = z.infer<typeof auctionDeletedMsgSchema>
export type TimerStartMsg = z.infer<typeof timerStartMsgSchema>
export type PlayerActionsType = z.infer<typeof playerActionsTypeSchema>
export type AuctionMessage =
  | NewBidMsg
  | NewSaleMsg
  | PlayerJoinMsg
  | PlayerLeaveMsg
  | ErrorMsg
  | AuctionMsg
  | BidUpdateMsg
  | SaleUpdateMsg
  | PlayerConnectedMsg
  | PlayerDisconnectedMsg
  | RoundEndMsg
  | AuctionEndMsg
  | AuctionDeletedMsg
  | TimerStartMsg
