import { Lobby, LobbyId } from '../schemas/Lobby'
import { LobbyRepository } from './LobbyRepository'
import { LobbyModel } from '../models/LobbyModel'
import { reverseLobbyConverter } from '../utils/Converters'

export class MongoLobbyRepo implements LobbyRepository {
    private readonly rev = reverseLobbyConverter

    async create(lobbyData: Omit<Lobby, 'id'>): Promise<Lobby> {
        try {
            const lobby = new LobbyModel(lobbyData)
            await lobby.save()
            return this.rev.convert(lobby.toObject())
        } catch (error) {
            throw new Error('An error occurred while creating the lobby')
        }
    }

    async delete(id: LobbyId): Promise<boolean> {
        try {
            const res = await LobbyModel.findByIdAndDelete(id)
            return !!res
        } catch (error) {
            throw new Error('An error occurred while deleting the lobby')
        }
    }

    async findById(id: LobbyId): Promise<Lobby | null> {
        try {
            const lobby = await LobbyModel.findById(id)
            return lobby ? this.rev.convert(lobby.toObject()) : null
        } catch (error) {
            throw new Error('An error occurred while finding the lobby')
        }
    }

    async update(id: LobbyId, updateData: Partial<Omit<Lobby, 'id'>>): Promise<Lobby | null> {
        try {
            const updatedLobby = await LobbyModel.findByIdAndUpdate(id, updateData, { new: true })
            return updatedLobby ? this.rev.convert(updatedLobby.toObject()) : null
        } catch (error) {
            throw new Error('An error occurred while updating the lobby')
        }
    }
}