import { z } from '@auction/common/zod'
import { InventoryOutputSchema } from './Item'

export const AuctionConfigSchema = z.object({
  id: z.string(),
  maxPlayers: z.number(),
  maxRound: z.number(),
  startAmount: z.number(),
  startInventory: InventoryOutputSchema,
  bidTime: z.number().min(1),
})

export const LobbyCreatedEventSchema = z.object({
  type: z.literal('lobby-created'),
  lobby: AuctionConfigSchema,
  creator: z.string(),
})
export const LobbyDeletedEventSchema = z.object({
  type: z.literal('lobby-deleted'),
  lobbyId: z.string(),
})
export const LobbyJoinedEventSchema = z.object({
  type: z.literal('lobby-joined'),
  lobbyId: z.string(),
  playerId: z.string(),
})
export const LobbyLeftEventSchema = z.object({
  type: z.literal('lobby-left'),
  lobbyId: z.string(),
  playerId: z.string(),
})
export const LobbyStartedEventSchema = z.object({
  type: z.literal('lobby-started'),
  lobbyId: z.string(),
})
export const LobbyEventTypeSchema = z.object({
  type: z.enum(['lobby-created', 'lobby-joined', 'lobby-left', 'lobby-started']),
})

export type LobbyEventType = z.infer<typeof LobbyEventTypeSchema>
export type LobbyCreatedEvent = z.infer<typeof LobbyCreatedEventSchema>
export type LobbyJoinedEvent = z.infer<typeof LobbyJoinedEventSchema>
export type LobbyLeftEvent = z.infer<typeof LobbyLeftEventSchema>
export type LobbyStartedEvent = z.infer<typeof LobbyStartedEventSchema>
export type LobbyDeletedEvent = z.infer<typeof LobbyDeletedEventSchema>
export type LobbyEvent = LobbyCreatedEvent | LobbyJoinedEvent | LobbyLeftEvent | LobbyStartedEvent | LobbyDeletedEvent
