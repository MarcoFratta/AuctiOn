import z from 'zod'
import { PlayerSchema } from './Player'
import { BidSchema } from './Bid'
import { SaleSchema } from './Sale'
import { InventoryOutputSchema } from './Item'

export const AuctionConfigSchema = z.object({
  id: z.string(),
  maxPlayers: z.number(),
  maxRound: z.number(),
  startAmount: z.number(),
  startInventory: InventoryOutputSchema,
  bidTime: z.number().min(1),
})
export const AuctionSchema = z
  .object({
    id: z.string(),
    players: z.array(PlayerSchema),
    maxRound: z.number(),
    sellerQueue: z.array(PlayerSchema.shape.id),
    currentRound: z.number(),
    currentSale: SaleSchema.optional(),
    currentBid: BidSchema.optional(),
    startTimestamp: z.date().optional(),
  })
  .merge(AuctionConfigSchema)
export const AuctionReportSchema = z.object({
  id: z.string(),
  leaderboard: z.array(PlayerSchema.omit({ status: true })),
  rounds: z.number(),
  startTimeStamp: z.date(),
  endTimeStamp: z.date(),
})

export type Auction = z.infer<typeof AuctionSchema>
export type AuctionConfig = z.infer<typeof AuctionConfigSchema>
