import z from 'zod'
import { AuctionConfigSchema } from './Auction'

export const LobbySchema = z.object({
  lobbyId: z.string(),
  creatorId: z.string(),
})

export const LobbyCreatedEvent = z.object({
  type: z.literal('lobby-created'),
  lobby: AuctionConfigSchema,
  creator: z.string(),
})
export const LobbyJoinedEvent = z.object({
  type: z.literal('lobby-joined'),
  lobbyId: z.string(),
  playerId: z.string(),
})
export const LobbyLeftEvent = z.object({
  type: z.literal('lobby-left'),
  lobbyId: z.string(),
  playerId: z.string(),
})
export const LobbyStartedEvent = z.object({
  type: z.literal('lobby-started'),
  lobbyId: z.string(),
})
export const LobbyEventTypeSchema = z.object({
  type: z.enum(['lobby-created', 'lobby-joined', 'lobby-left', 'lobby-started']),
})

export type LobbyEventType = z.infer<typeof LobbyEventTypeSchema>
export type LobbyCreatedEvent = z.infer<typeof LobbyCreatedEvent>
export type LobbyJoinedEvent = z.infer<typeof LobbyJoinedEvent>
export type LobbyLeftEvent = z.infer<typeof LobbyLeftEvent>
export type LobbyStartedEvent = z.infer<typeof LobbyStartedEvent>
export type LobbyEvent = LobbyCreatedEvent | LobbyJoinedEvent | LobbyLeftEvent | LobbyStartedEvent
