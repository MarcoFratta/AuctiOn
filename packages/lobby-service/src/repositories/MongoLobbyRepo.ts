import { Lobby } from '../schemas/Lobby'
import { LobbyRepository } from './LobbyRepository'
import { LobbyModel } from '../models/LobbyModel'
import { reverseLobbyConverter } from '../converters/LobbyConverters'
import logger from '@auction/common/logger'
import { LobbyNotFoundError } from '../errors/LobbyErrors'

export class MongoLobbyRepo implements LobbyRepository {
  private readonly rev = reverseLobbyConverter

  async create(lobbyData: Omit<Lobby, 'id'>): Promise<Lobby> {
    try {
      const lobby = new LobbyModel(lobbyData)
      await lobby.save()
      return this.rev.convert(lobby.toObject())
    } catch (error) {
      logger.error(error)
      throw new Error('An error occurred while creating the lobby')
    }
  }

  async delete(id: string): Promise<Lobby> {
    const res = await LobbyModel.findByIdAndDelete(id)
    if (!res) {
      throw new LobbyNotFoundError(id)
    }
    return this.rev.convert(res.toObject())
  }

  async findById(id: string): Promise<Lobby | null> {
    try {
      const lobby = await LobbyModel.findById(id)
      return lobby ? this.rev.convert(lobby.toObject()) : null
    } catch (error) {
      logger.error(error)
      throw new Error('An error occurred while finding the lobby')
    }
  }

  async update(id: string, lobby: Partial<Lobby>): Promise<Lobby | null> {
    try {
      const updatedLobby = await LobbyModel.findByIdAndUpdate(id, { $set: lobby }, { new: true })
      return updatedLobby ? this.rev.convert(updatedLobby.toObject()) : null
    } catch (error) {
      logger.error(error)
      throw new Error('An error occurred while updating the lobby')
    }
  }
}
