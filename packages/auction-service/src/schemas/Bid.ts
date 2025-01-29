import z from 'zod'

export const BidSchema = z.object({
  playerId: z.string(),
  amount: z.number().min(1),
  round: z.number(),
  timestamp: z.string().datetime(),
})

export type Bid = z.infer<typeof BidSchema>
