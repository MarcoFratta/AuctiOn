import z from 'zod'
import { AuctionConfigSchema } from './Auction'

export const LobbySchema = z.object({
  lobbyId: z.string(),
  creatorId: z.string(),
})

export const lobbyCreatedEvent = z.object({
  type: z.literal('lobby-created'),
  lobby: AuctionConfigSchema,
  creator: z.string(),
})
export const lobbyJoinedEvent = z.object({
  type: z.literal('lobby-joined'),
  lobbyId: z.string(),
  playerId: z.string(),
})
export const lobbyLeftEvent = z.object({
  type: z.literal('lobby-left'),
  lobbyId: z.string(),
  playerId: z.string(),
})
export const lobbyStartedEvent = z.object({
  type: z.literal('lobby-started'),
  lobbyId: z.string(),
})
export const lobbyDeletedEvent = z.object({
  type: z.literal('lobby-deleted'),
  lobbyId: z.string(),
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
