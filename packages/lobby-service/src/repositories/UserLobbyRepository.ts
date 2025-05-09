import { UserLobby } from '../schemas/UserLobby'

export interface UserLobbyRepository {
  addUserToLobby(userId: string, lobbyId: string): Promise<UserLobby>

  getUserActiveLobby(userId: string): Promise<UserLobby | null>

  startMatch(lobbyId: string): Promise<void>

  removeUserFromLobby(userId: string, lobbyId: string): Promise<void>

  removeLobbyUsers(lobbyId: string): Promise<void>

  leaveLobby(userId: string): Promise<void>

  terminateMatch(lobbyId: string): Promise<void>
}
