import { z } from '@auction/common/zod'
import { ItemSchema } from './Item'
import { playerStatusEventSchema } from '@auction/common/events/lobby'

export const ItemsMapSchema = z.map(ItemSchema, z.number().min(0))
export const PlayerStatusSchema = z.enum(['connected', 'not-connected'])
export const PlayerSchema = z.object({
  money: z.number().min(0),
  inventory: ItemsMapSchema,
  id: z.string(),
  status: PlayerStatusSchema,
})
export const PlayerInfoSchema = z.object({
  username: z.string(),
  status: playerStatusEventSchema.shape.status,
})

export type Player = z.infer<typeof PlayerSchema>
export type PlayerInfo = z.infer<typeof PlayerInfoSchema>
export type ItemsMap = z.infer<typeof ItemsMapSchema>
export type PlayerState = z.infer<typeof PlayerStatusSchema>
