import { z } from '@auction/common/zod'
import { auctionConfigSchema, playerSchema } from './Auction'

export const lobbySchema = z.object({
  lobbyId: z.string(),
  creatorId: playerSchema.shape.id,
})

export const lobbyCreatedEvent = z.object({
  type: z.literal('lobby-created'),
  lobby: auctionConfigSchema,
  creator: playerSchema.shape.id,
})
export const lobbyJoinedEvent = z.object({
  type: z.literal('lobby-joined'),
  lobbyId: lobbySchema.shape.lobbyId,
  playerId: playerSchema.shape.id,
})
export const lobbyLeftEvent = z.object({
  type: z.literal('lobby-left'),
  lobbyId: lobbySchema.shape.lobbyId,
  playerId: playerSchema.shape.id,
})
export const lobbyStartedEvent = z.object({
  type: z.literal('lobby-started'),
  lobbyId: lobbySchema.shape.lobbyId,
})
export const lobbyDeletedEvent = z.object({
  type: z.literal('lobby-deleted'),
  lobbyId: lobbySchema.shape.lobbyId,
})
export const lobbyEventTypeSchema = z.object({
  type: z.enum(['lobby-created', 'lobby-joined', 'lobby-left', 'lobby-started', 'lobby-deleted']),
})

export type LobbyEventType = z.infer<typeof lobbyEventTypeSchema>
export type LobbyCreatedEvent = z.infer<typeof lobbyCreatedEvent>
export type LobbyJoinedEvent = z.infer<typeof lobbyJoinedEvent>
export type LobbyLeftEvent = z.infer<typeof lobbyLeftEvent>
export type LobbyStartedEvent = z.infer<typeof lobbyStartedEvent>
export type LobbyDeletedEvent = z.infer<typeof lobbyDeletedEvent>
export type LobbyEvent = LobbyCreatedEvent | LobbyJoinedEvent | LobbyLeftEvent | LobbyStartedEvent | LobbyDeletedEvent
