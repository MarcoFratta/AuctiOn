import z, { ZodSchema } from 'zod'
import { ItemSchema } from './Item'
import { PlayerSchema } from './Player'
import { AuctionSchema } from './Auction'

export const BidMsgSchema = z.object({
  amount: z.number().min(1),
  round: z.number(),
})

const ItemQuantitySchema = z.object({
  item: ItemSchema,
  quantity: z.number().min(1),
})

export const InventoryFactory = (schema: ZodSchema) => {
  return z.object({
    items: z
      .array(schema)
      .nonempty()
      .max(ItemSchema.options.length)
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
}

export const InventoryInputSchema = InventoryFactory(ItemQuantitySchema)
export const InventoryOutputSchema = InventoryFactory(
  ItemQuantitySchema.extend({
    quantity: z.number().min(0),
  })
)
export const PlayerInfoSchema = z.object({
  inventory: InventoryOutputSchema,
  money: PlayerSchema.shape.money,
})
export const SaleInfoSchema = z.object({
  weight: z.number(),
})

export const PlayerAuctionSchema = AuctionSchema.extend({
  playerInfo: PlayerInfoSchema,
  saleInfo: SaleInfoSchema.optional(),
}).omit({ players: true, currentSale: true })

export const MessageTypeSchema = z.enum(['sell', 'bid'])

export type SaleInfo = z.infer<typeof SaleInfoSchema>
export type PlayerAuction = z.infer<typeof PlayerAuctionSchema>
export type MessageType = z.infer<typeof MessageTypeSchema>
export type InventoryInputMsg = z.infer<typeof InventoryInputSchema>
export type InventoryOutputMsg = z.infer<typeof InventoryOutputSchema>
export type BidMessage = z.infer<typeof BidMsgSchema>
export type PlayerInfoMessage = z.infer<typeof PlayerInfoSchema>
