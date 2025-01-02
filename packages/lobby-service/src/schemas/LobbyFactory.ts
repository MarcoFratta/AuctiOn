import { Lobby, LobbyConfig, Player } from './Lobby';

export const createNewPlayer = (userId: string): Player => {
  return {
    userId,
    status: 'waiting',
  };
};
export const createNewLobby = (
  config: LobbyConfig,
  creatorId: string,
): Omit<Lobby, 'id'> => {
  return {
    creator: creatorId,
    players: [createNewPlayer(creatorId)],
    status: 'waiting',
    ...config,
  };
};
