import { z } from '../utils/ZodWrapper'

export const lobbyId = z.object({
    id: z.string().min(24),
})
export const playerStatusSchema = z.enum(['ready', 'waiting'])
export const playerSchema = z.object({
    userId: z.string(),
    status: playerStatusSchema.default('waiting'),
})

export const lobbySchema = z.object({
    id: lobbyId.shape.id,
    creator: z.string().min(1).openapi({ example: 'creatorId' }),
    players: z.array(playerSchema).openapi({ example: [{ userId: 'player1', status: 'waiting' }] }),
    maxPlayers: z.number().min(1).openapi({ example: 10 }),
    rounds: z.number().min(1).openapi({ example: 5 }),
    status: z.enum(['waiting', 'in-progress', 'completed']).default('waiting'),
})

export type Lobby = z.infer<typeof lobbySchema>;
export type LobbyId = z.infer<typeof lobbyId.shape.id>;
export type PlayerStatus = z.infer<typeof playerStatusSchema>;