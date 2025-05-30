import { UserLobby } from '../schemas/UserLobby'
import { UserLobbyModel } from '../models/UserLobbyModel'
import { toUserLobby } from '../converters/UserLobbyConverter'
import { UserLobbyRepository } from './UserLobbyRepository'

export class MongoUserLobbyRepo implements UserLobbyRepository {
  private readonly converter = toUserLobby

  async addUserToLobby(userId: string, lobbyId: string): Promise<UserLobby> {
    const doc = await UserLobbyModel.create({
      userId,
      lobbyId,
      state: 'waiting',
    })
    return this.converter.convert(doc)
  }

  async getUserActiveLobby(userId: string): Promise<UserLobby | null> {
    const doc = await UserLobbyModel.findOne({
      userId,
      state: { $ne: 'completed' },
      leftAt: null,
    })
    return doc ? this.converter.convert(doc) : null
  }

  async startMatch(lobbyId: string): Promise<void> {
    await UserLobbyModel.updateMany({ lobbyId, leftAt: null }, { state: 'in-progress' })
  }

  async removeUserFromLobby(userId: string, lobbyId: string): Promise<void> {
    const doc = await UserLobbyModel.findOne({
      userId,
      lobbyId,
    })

    if (doc) {
      await UserLobbyModel.deleteOne({ _id: doc._id })
    }
  }

  async removeLobbyUsers(lobbyId: string): Promise<void> {
    await UserLobbyModel.deleteMany({
      lobbyId,
    })
  }

  async leaveLobby(userId: string): Promise<void> {
    await UserLobbyModel.updateOne({ userId, state: 'waiting' }, { leftAt: new Date() })
  }

  async terminateMatch(lobbyId: string): Promise<void> {
    await UserLobbyModel.updateMany({ lobbyId, state: 'in-progress' }, { state: 'completed', leftAt: new Date() })
  }
}
