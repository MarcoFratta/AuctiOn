import z, { ZodSchema } from 'zod'

export const ItemSchema = z.enum(['square', 'triangle', 'circle'])

export const ItemWeights: Record<string, number> = {
  [ItemSchema.enum.square]: 1,
  [ItemSchema.enum.triangle]: 2,
  [ItemSchema.enum.circle]: 3,
}
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
export type Item = z.infer<typeof ItemSchema>
export type InventoryInput = z.infer<typeof InventoryInputSchema>
export type InventoryOutput = z.infer<typeof InventoryOutputSchema>
