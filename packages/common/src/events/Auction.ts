import { z } from '@auction/common/zod'

export const inventorySchema = z.object({
  items: z.array(
    z.object({
      item: z.string(),
      quantity: z.number().min(0),
    })
  ),
})
export const playerSchema = z.object({
  money: z.number().min(0),
  inventory: inventorySchema,
  id: z.string(),
  status: z.string(),
})
export const saleSchema = z.object({
  items: inventorySchema,
  sellerId: playerSchema.shape.id,
  endTimestamp: z.string().datetime().optional(),
})
export const bidSchema = z.object({
  playerId: playerSchema.shape.id,
  amount: z.number().min(1),
  round: z.number().min(1),
  timestamp: z.string().datetime(),
})
export const leaderboardEntry = z.object({
  id: playerSchema.shape.id,
  inventory: inventorySchema,
  money: playerSchema.shape.money,
  position: z.number().min(1),
})
export const leaderboardSchema = z.object({
  leaderboard: z.array(leaderboardEntry),
  removed: z.array(leaderboardEntry.omit({ position: true })),
})
export const auctionConfigSchema = z.object({
  id: z.string(),
  maxPlayers: z.number().min(2).max(50),
  maxRound: z.number().min(1).max(20),
  startAmount: z.number().min(0).max(5000),
  startInventory: inventorySchema,
  bidTime: z.number().min(10).max(60),
})
export const auctionSchema = z
  .object({
    creatorId: playerSchema.shape.id,
    players: z.array(playerSchema),
    sellerQueue: z.array(playerSchema.shape.id),
    currentRound: z.number().min(1),
    currentSale: saleSchema.optional(),
    currentBid: bidSchema.optional(),
    startTimestamp: z.string().datetime().optional(),
  })
  .merge(auctionConfigSchema)
