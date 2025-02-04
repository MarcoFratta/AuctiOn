import { z } from '@auction/common/zod'
import { ItemsMapSchema } from './Player'

export const SaleSchema = z.object({
  items: ItemsMapSchema,
  sellerId: z.string(),
  endTimestamp: z.string().datetime().optional(),
})

export type Sale = z.infer<typeof SaleSchema>
