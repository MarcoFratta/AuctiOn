import { z } from '@auction/common/zod'
import { auctionEventTypeSchema } from '@auction/common'
import { lobbyEventTypeSchema } from '@auction/common/events/lobby'

export const eventTypeSchema = z.enum([...auctionEventTypeSchema.options, ...lobbyEventTypeSchema.shape.type.options])
export type EventType = z.infer<typeof eventTypeSchema>
