import { z } from '@auction/common/zod'
import { ItemsMapSchema } from './Player'

export const SaleSchema = z.object({
  items: ItemsMapSchema,
  sellerId: z.string(),
  endTimestamp: z.string().datetime().optional(),
})
export const saleInfoSchema = SaleSchema.merge(
  z.object({
    info: z.object({
      weight: z.number(),
    }),
    items: z.never(),
  })
).omit({ items: true })

export type Sale = z.infer<typeof SaleSchema>
export type SaleInfo = z.infer<typeof saleInfoSchema>
