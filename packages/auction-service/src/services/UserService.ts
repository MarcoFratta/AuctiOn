import { Player, PlayerInfo } from '../schemas/Player'

export interface UserService {
  addUser(id: Player['id'], info: PlayerInfo): Promise<void>

  removeUser(id: Player['id']): Promise<void>

  getUser(id: Player['id']): Promise<PlayerInfo | undefined>
}
