import { Player, PlayerInfo } from '../schemas/Player'
import { UserEventSource } from './UserEventSource'

export interface UserService extends UserEventSource {
  addUser(id: Player['id'], info: PlayerInfo): Promise<void>
  updateUser(id: Player['id'], info: Partial<PlayerInfo>): Promise<void>
  removeUser(id: Player['id']): Promise<void>
  getUser(id: Player['id']): Promise<PlayerInfo | undefined>
}
