import z from 'zod'

export const WithAuctionId = z.object({
  auctionId: z.string(),
})
z.object({
  playerId: z.string(),
})
export const WithTimestamp = z.object({
  timestamp: z.string().datetime(),
})
export const EndAuctionEventSchema = z
  .object({
    type: z.literal('end-auction'),
  })
  .merge(WithAuctionId)
  .merge(WithTimestamp)

export const AuctionEventTypeSchema = z.object({
  type: z.enum(['end-auction']),
})
export type AuctionEventType = z.infer<typeof AuctionEventTypeSchema>
export type EndAuctionEvent = z.infer<typeof EndAuctionEventSchema>
export type AuctionEvent = EndAuctionEvent
