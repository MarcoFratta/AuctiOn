import z from 'zod'
import { AuctionSchema } from './Auction'
import { PlayerSchema } from './Player'
import { BidMsgSchema } from './AuctionMessages'
import { SaleSchema } from './Sale'

export const WithAuctionId = z.object({
  auctionId: AuctionSchema.shape.id,
})
export const WithPlayerId = z.object({
  playerId: PlayerSchema.shape.id,
})
export const WithTimestamp = z.object({
  timestamp: z.date(),
})
export const PlayerConnectedEventSchema = z
  .object({
    type: z.literal('player-connected'),
  })
  .merge(WithAuctionId)
  .merge(WithPlayerId)
  .merge(WithTimestamp)

export const PlayerDisconnectedEventSchema = z
  .object({
    type: z.literal('player-disconnected'),
  })
  .merge(WithAuctionId)
  .merge(WithPlayerId)
  .merge(WithTimestamp)

export const PlayerStatusChangeEventSchema = z
  .object({
    type: z.literal('player-status-change'),
  })
  .merge(WithAuctionId)
  .merge(WithPlayerId)
  .merge(WithTimestamp)

export const BidEventSchema = z
  .object({
    type: z.literal('player-bid'),
    bid: BidMsgSchema,
  })
  .merge(WithAuctionId)
  .merge(WithPlayerId)

export const SaleEventSchema = z
  .object({
    type: z.literal('player-sale'),
    sale: SaleSchema.omit({ endTimestamp: true }),
  })
  .merge(WithAuctionId)
  .merge(WithPlayerId)
  .merge(WithTimestamp)

export const EndRoundEventSchema = z
  .object({
    type: z.literal('end-round'),
  })
  .merge(WithAuctionId)
  .merge(WithTimestamp)

export const EndAuctionEventSchema = z
  .object({
    type: z.literal('end-auction'),
  })
  .merge(WithAuctionId)
  .merge(WithTimestamp)

export type PlayerConnectedEvent = z.infer<typeof PlayerConnectedEventSchema>
export type PlayerDisconnectedEvent = z.infer<typeof PlayerDisconnectedEventSchema>
export type PlayerStatusChangeEvent = z.infer<typeof PlayerStatusChangeEventSchema>
export type BidEvent = z.infer<typeof BidEventSchema>
export type SaleEvent = z.infer<typeof SaleEventSchema>
export type EndRoundEvent = z.infer<typeof EndRoundEventSchema>
export type EndAuctionEvent = z.infer<typeof EndAuctionEventSchema>
export type AuctionEvent =
  | PlayerConnectedEvent
  | PlayerDisconnectedEvent
  | PlayerStatusChangeEvent
  | BidEvent
  | SaleEvent
  | EndRoundEvent
  | EndAuctionEvent
