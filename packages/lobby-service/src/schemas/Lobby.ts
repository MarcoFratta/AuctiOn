import { z } from '@auction/common/zod'
import { InventoryInputSchema } from './Item'

export const idSchema = z.string().length(24)
export const lobbyIdSchema = z.object({
  id: idSchema,
})
const playerStatus = z.enum(['ready', 'waiting'])
export const playerStatusSchema = z.object({
  status: playerStatus,
})
export const playerSchema = z
  .object({
    userId: z.string().min(1),
  })
  .merge(playerStatusSchema)
export const playerInfoSchema = z.object({
  username: z.string().min(1).max(30),
})
export const lobbyConfigSchema = z.object({
  maxPlayers: z.number().min(1).max(10),
  rounds: z.number().min(1).max(10),
  startAmount: z.number().min(1),
  startInventory: InventoryInputSchema,
  bidTime: z.number().min(1),
})
export const lobbyStatusSchema = z.enum(['waiting', 'in-progress', 'completed'])
export const lobbySchema = lobbyIdSchema
  .extend(
    z.object({
      creator: z.string().min(1).openapi({ example: 'creatorId' }),
      players: z.array(playerSchema).openapi({ example: [{ userId: 'player1', status: 'waiting' }] }),
      status: lobbyStatusSchema,
    }).shape
  )
  .merge(lobbyConfigSchema)

export type Lobby = z.infer<typeof lobbySchema>
export type LobbyId = z.infer<typeof lobbyIdSchema>
export type Player = z.infer<typeof playerSchema>
export type PlayerInfo = z.infer<typeof playerInfoSchema>
export type PlayerStatus = z.infer<typeof playerStatus>
export type LobbyConfig = z.infer<typeof lobbyConfigSchema>
export type LobbyStatus = z.infer<typeof lobbyStatusSchema>
