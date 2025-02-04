import { z } from '@auction/common/zod'

export const TimerMessageSchema = z.object({
  type: z.literal('timer-start'),
  timestamp: z.number(),
})
