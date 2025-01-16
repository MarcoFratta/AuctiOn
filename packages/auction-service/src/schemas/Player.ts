import z from 'zod'
import { ItemSchema } from './Item'

export const ItemsMapSchema = z.map(ItemSchema, z.number().min(0))

export const PlayerSchema = z.object({
  money: z.number().min(0),
  inventory: ItemsMapSchema,
  id: z.string(),
  status: z.string(),
})

export type Player = z.infer<typeof PlayerSchema>
export type ItemsMap = z.infer<typeof ItemsMapSchema>
