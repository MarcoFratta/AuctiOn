import { Lobby } from '../schemas/Lobby'

export interface LobbyRepository {
    create(lobbyData: Omit<Lobby, 'id'>): Promise<Lobby>;

    delete(id: string): Promise<boolean>;

    findById(id: string): Promise<Lobby | null>;

    update(id: string, updateData: Partial<Omit<Lobby, 'id'>>): Promise<Lobby | null>;
}