import { z } from 'zod'

const ItemQuantitySchema = z.object({
  item: z.string(),
  quantity: z.number().int().min(1).max(50),
})
const inventorySchema = z.object({
  items: z.array(ItemQuantitySchema).nonempty().max(3),
})

export const lobbyConfigSchema = z.object({
  maxPlayers: z.number().int().min(1).max(10),
  rounds: z.number().int().min(1).max(10),
  startAmount: z.number().int().min(1).max(1000),
  startInventory: inventorySchema,
  bidTime: z.number().int().min(1).max(60),
})

export type Inventory = z.infer<typeof inventorySchema>
export type ItemQuantity = z.infer<typeof ItemQuantitySchema>
export type LobbyConfig = z.infer<typeof lobbyConfigSchema>
