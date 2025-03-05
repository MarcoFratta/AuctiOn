import { z } from 'zod'
import { auctionConfigSchema, playerSchema } from './Auction.js'

export const lobbySchema = z.object({
  lobbyId: z.string(),
  creatorId: playerSchema.shape.id,
})

export const lobbyCreatedEventSchema = z.object({
  type: z.literal('lobby-created'),
  lobby: auctionConfigSchema,
  creator: playerSchema.shape.id,
})
export const lobbyJoinedEventSchema = z.object({
  type: z.literal('lobby-joined'),
  lobbyId: lobbySchema.shape.lobbyId,
  playerId: playerSchema.shape.id,
})
export const lobbyLeftEventSchema = z.object({
  type: z.literal('lobby-left'),
  lobbyId: lobbySchema.shape.lobbyId,
  playerId: playerSchema.shape.id,
})
export const lobbyStartedEventSchema = z.object({
  type: z.literal('lobby-started'),
  lobbyId: lobbySchema.shape.lobbyId,
})
export const lobbyDeletedEventSchema = z.object({
  type: z.literal('lobby-deleted'),
  lobbyId: lobbySchema.shape.lobbyId,
})
export const lobbyEventTypeSchema = z.object({
  type: z.enum(['lobby-created', 'lobby-joined', 'lobby-left', 'lobby-started', 'lobby-deleted']),
})

export type LobbyEventType = z.infer<typeof lobbyEventTypeSchema>
export type LobbyCreatedEvent = z.infer<typeof lobbyCreatedEventSchema>
export type LobbyJoinedEvent = z.infer<typeof lobbyJoinedEventSchema>
export type LobbyLeftEvent = z.infer<typeof lobbyLeftEventSchema>
export type LobbyStartedEvent = z.infer<typeof lobbyStartedEventSchema>
export type LobbyDeletedEvent = z.infer<typeof lobbyDeletedEventSchema>
export type LobbyEvent = LobbyCreatedEvent | LobbyJoinedEvent | LobbyLeftEvent | LobbyStartedEvent | LobbyDeletedEvent
