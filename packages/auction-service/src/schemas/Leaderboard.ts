import { z } from '@auction/common/zod'
import { InventoryOutputSchema } from './Item'
import { PlayerSchema } from './Player'

export const leaderboardEntry = z.object({
  id: PlayerSchema.shape.id,
  inventory: InventoryOutputSchema,
  money: PlayerSchema.shape.money,
  position: z.number().min(1),
})
export const leaderboardSchema = z.object({
  leaderboard: z.array(leaderboardEntry),
  removed: z.array(leaderboardEntry.omit({ position: true })),
})

export type LeaderboardEntry = z.infer<typeof leaderboardEntry>
export type Leaderboard = z.infer<typeof leaderboardSchema>
