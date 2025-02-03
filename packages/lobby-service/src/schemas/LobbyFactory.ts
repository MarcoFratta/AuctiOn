import { Lobby, LobbyConfig, lobbySchema, Player } from './Lobby'
import { validateSchema } from '@auction/common/validation'

export const createNewPlayer = (userId: string): Player => {
  return {
    userId,
    status: 'waiting',
  }
}
export const createNewLobby = (config: LobbyConfig, creatorId: string): Omit<Lobby, 'id'> => {
  return validateSchema(lobbySchema.omit({ id: true }), {
    creator: creatorId,
    players: [createNewPlayer(creatorId)],
    status: 'waiting',
    ...config,
  })
}
