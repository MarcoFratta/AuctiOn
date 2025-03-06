import { Lobby } from '../schemas/Lobby'

export interface LobbyEventsSource {
  onLobbyCreated(callback: (lobby: Lobby) => void): void

  onLobbyDeleted(callback: (lobbyId: Lobby) => void): void

  onLobbyJoined(callback: (lobbyId: Lobby, playerId: string) => void): void

  onLobbyLeft(callback: (lobbyId: Lobby, playerId: string) => void): void

  onPlayerStatusChanged(callback: (lobbyId: Lobby, playerId: string) => void): void

  onLobbyStarted(callback: (lobbyId: Lobby) => void): void
}
