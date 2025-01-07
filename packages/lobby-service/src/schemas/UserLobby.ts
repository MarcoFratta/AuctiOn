import { z } from '../utils/ZodWrapper';
import { lobbyStatusSchema } from './Lobby';

export const userLobbySchema = z.object({
  userId: z.string().min(1),
  lobbyId: z.string().min(1),
  state: lobbyStatusSchema,
  joinedAt: z.date(),
  leftAt: z.date().optional(),
});

export type UserLobby = z.infer<typeof userLobbySchema>;
