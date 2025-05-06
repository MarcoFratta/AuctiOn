import { z } from 'zod'
import { bidSchema, inventorySchema, leaderboardSchema, playerLobbyInfoSchema } from './Auction.js'

const withAuctionId = z.object({
  auctionId: z.string(),
})
const withPlayerId = z.object({
  playerId: z.string(),
})
const withTimestamp = z.object({
  timestamp: z.string().datetime(),
})
export const playerConnectedEventSchema = z
  .object({
    type: z.literal('player-connected'),
  })
  .merge(withAuctionId)
  .merge(withPlayerId)
  .merge(withTimestamp)

export const playerDisconnectedEventSchema = z
  .object({
    type: z.literal('player-disconnected'),
  })
  .merge(withAuctionId)
  .merge(withPlayerId)
  .merge(withTimestamp)

export const endRoundEventSchema = z
  .object({
    type: z.literal('end-round'),
  })
  .merge(withAuctionId)
  .merge(withTimestamp)

export const endAuctionEventSchema = z
  .object({
    type: z.literal('end-auction'),
    leaderboard: leaderboardSchema,
  })
  .merge(withAuctionId)
  .merge(withTimestamp)
export const saleEventSchema = z
  .object({
    type: z.literal('sale'),
    sale: inventorySchema,
  })
  .merge(withAuctionId)
  .merge(withPlayerId)
  .merge(withTimestamp)
export const playerUpdateEventSchema = z
  .object({
    type: z.literal('player-update'),
    playerId: z.string(),
  })
  .merge(playerLobbyInfoSchema)

export const bidEventSchema = z
  .object({
    type: z.literal('bid'),
    bid: bidSchema.omit({ playerId: true, timestamp: true }),
  })
  .merge(withAuctionId)
  .merge(withPlayerId)
  .merge(withTimestamp)
export const timerStartSchema = z
  .object({
    type: z.literal('timer-start'),
    timer: z.number(),
  })
  .merge(withAuctionId)

export const auctionEventTypeSchema = z.enum([
  'player-connected',
  'player-disconnected',
  'player-update',
  'timer-start',
  'end-round',
  'end-auction',
  'sale',
  'bid',
])
export type AuctionEventType = z.infer<typeof auctionEventTypeSchema>
export type PlayerConnectedEvent = z.infer<typeof playerConnectedEventSchema>
export type PlayerDisconnectedEvent = z.infer<typeof playerDisconnectedEventSchema>
export type EndRoundEvent = z.infer<typeof endRoundEventSchema>
export type EndAuctionEvent = z.infer<typeof endAuctionEventSchema>
export type SaleEvent = z.infer<typeof saleEventSchema>
export type BidEvent = z.infer<typeof bidEventSchema>
export type PlayerUpdateEvent = z.infer<typeof playerUpdateEventSchema>
export type TimerStartEvent = z.infer<typeof timerStartSchema>
export type AuctionEvent =
  | SaleEvent
  | PlayerUpdateEvent
  | BidEvent
  | PlayerConnectedEvent
  | PlayerDisconnectedEvent
  | EndRoundEvent
  | EndAuctionEvent
  | TimerStartEvent
