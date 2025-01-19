import z from 'zod'

export const ItemSchema = z.enum(['square', 'triangle', 'circle'])

export const ItemWeights: Record<Item, number> = {
  [ItemSchema.enum.square]: 1,
  [ItemSchema.enum.triangle]: 2,
  [ItemSchema.enum.circle]: 3,
}

export type Item = z.infer<typeof ItemSchema>
