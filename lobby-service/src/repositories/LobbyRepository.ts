import { Lobby, LobbyId } from '../schemas/Lobby'

export interface LobbyRepository {
    create(lobbyData: Omit<Lobby, 'id'>): Promise<Lobby>;

    delete(id: LobbyId): Promise<boolean>;

    findById(id: LobbyId): Promise<Lobby | null>;

    update(id: LobbyId, updateData: Partial<Omit<Lobby, 'id'>>): Promise<Lobby | null>;
}