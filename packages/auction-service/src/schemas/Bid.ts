import z from 'zod'

export const BidSchema = z.object({
  playerId: z.string().optional(),
  amount: z.number(),
  round: z.number(),
  timestamp: z.date(),
})

export type Bid = z.infer<typeof BidSchema>
