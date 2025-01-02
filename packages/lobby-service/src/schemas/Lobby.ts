import { z } from '../utils/ZodWrapper';

export const idSchema = z.string().length(24);
export const lobbyId = z.object({
  id: idSchema,
});
const playerStatus = z.enum(['ready', 'waiting']);
export const playerStatusSchema = z.object({
  status: playerStatus,
});
export const playerSchema = z
  .object({
    userId: z.string().min(1),
  })
  .merge(playerStatusSchema);

export const lobbyConfigSchema = z.object({
  maxPlayers: z.number().min(1).max(10),
  rounds: z.number().min(1).max(10),
});

export const lobbySchema = lobbyId
  .extend({
    creator: z.string().min(1).openapi({ example: 'creatorId' }),
    players: z
      .array(playerSchema)
      .openapi({ example: [{ userId: 'player1', status: 'waiting' }] }),
    status: z.enum(['waiting', 'in-progress', 'completed']),
  })
  .merge(lobbyConfigSchema);

export type Lobby = z.infer<typeof lobbySchema>;
export type LobbyId = z.infer<typeof lobbyId>;
export type Player = z.infer<typeof playerSchema>;
export type PlayerStatus = z.infer<typeof playerStatus>;
export type LobbyConfig = z.infer<typeof lobbyConfigSchema>;
