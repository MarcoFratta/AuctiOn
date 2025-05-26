import { z } from '@auction/common/zod'
import { PlayerSchema } from './Player'
import { BidSchema } from './Bid'
import { saleInfoSchema, SaleSchema } from './Sale'
import { InventoryOutputSchema } from './Item'

export const auctionConfigSchema = z.object({
  id: z.string(),
  creatorId: z.string(),
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
    startTimestamp: z.string().datetime().optional(),
  })
  .merge(auctionConfigSchema)
export const StoredAuctionSchema = AuctionSchema.merge(
  z.object({
    currentSale: SaleSchema.merge(
      z.object({
        items: InventoryOutputSchema,
      })
    ).optional(),
    players: z.array(
      PlayerSchema.merge(
        z.object({
          inventory: InventoryOutputSchema,
        })
      )
    ),
  })
)
export const auctionMsgSchema = AuctionSchema.merge(
  z.object({
    currentSale: saleInfoSchema.optional(),
  })
)
export type AuctionInfo = z.infer<typeof AuctionSchema>
export type AuctionMessage = z.infer<typeof auctionMsgSchema>
export type AuctionConfig = z.infer<typeof auctionConfigSchema>
export type StoredAuction = z.infer<typeof StoredAuctionSchema>
