import z from 'zod'
import { ItemSchema } from './Item'

export const BidMsgSchema = z.object({
  amount: z.number().min(1),
  round: z.number(),
})

export const SaleMsgSchema = z.object({
  items: z
    .array(
      z.object({
        item: ItemSchema,
        quantity: z.number().min(1),
      })
    )
    .nonempty()
    .max(3)
    .superRefine((set, ctx) => {
      const seenItems = new Set<string>()
      for (const element of set) {
        if (seenItems.has(element.item)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `Duplicate items found: ${element.item}`,
          })
        }
        seenItems.add(element.item)
      }
    }),
})

export const MessageTypeSchema = z.enum(['sell', 'bid'])

export type MessageType = z.infer<typeof MessageTypeSchema>
export type SaleMessage = z.infer<typeof SaleMsgSchema>
export type BidMessage = z.infer<typeof BidMsgSchema>
