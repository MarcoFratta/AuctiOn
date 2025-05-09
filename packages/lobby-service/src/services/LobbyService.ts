import { Lobby, PlayerInfo, PlayerStatus } from '../schemas/Lobby'
import { LobbyEventsSource } from './LobbyEventsSource'

export interface LobbyService extends LobbyEventsSource {
  createLobby(lobbyData: Omit<Lobby, 'id'>): Promise<Lobby>

  deleteLobby(id: string): Promise<boolean>

  joinLobby(id: string, userId: string): Promise<Lobby>

  leaveLobby(id: string, userId: string): Promise<Lobby | null>

  kickPlayer(id: string, creator: string, playerId: string): Promise<Lobby>

  setStatus(id: string, userId: string, status: PlayerStatus): Promise<Lobby>

  startMatch(id: string, creator: string): Promise<Lobby>

  getPlayer(id: string): Promise<PlayerInfo>

  getLobby(id: string): Promise<Lobby>

  terminateMatch(id: string): Promise<void>
}
