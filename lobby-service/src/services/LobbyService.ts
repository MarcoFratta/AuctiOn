import { Lobby, PlayerStatus } from '../schemas/Lobby'

export interface LobbyService {
    createLobby(lobbyData: Omit<Lobby, 'id'>): Promise<Lobby>

    deleteLobby(id: string): Promise<boolean>

    joinLobby(id: string, userId: string): Promise<Lobby>

    leaveLobby(id: string, userId: string): Promise<Lobby>

    kickPlayer(id: string, creator: string, playerId: string): Promise<Lobby>

    setStatus(id: string, userId: string, status: PlayerStatus): Promise<Lobby>

    startMatch(id: string, creator: string): Promise<Lobby>
}