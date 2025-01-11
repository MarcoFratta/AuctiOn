import z from 'zod'
import { PlayerSchema } from './Player'
import { BidSchema } from './Bid'
import { SaleSchema } from './Sale'

export const AuctionSchema = z.object({
  id: z.string(),
  players: z.array(PlayerSchema),
  maxRound: z.number(),
  sellerQueue: z.array(PlayerSchema.shape.id),
  currentRound: z.number(),
  currentSale: SaleSchema.optional(),
  currentBid: BidSchema,
  startTimestamp: z.date(),
})

export const AuctionReportSchema = z.object({
  id: z.string(),
  leaderboard: z.array(PlayerSchema.omit({ status: true })),
  rounds: z.number(),
  startTimeStamp: z.date(),
  endTimeStamp: z.date(),
})

export type Auction = z.infer<typeof AuctionSchema>
