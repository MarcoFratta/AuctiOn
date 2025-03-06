import { Player, PlayerInfo } from '../schemas/Player'

export interface UserService {
  addUser(id: Player['id'], info: PlayerInfo): Promise<void>

  updateUser(id: Player['id'], info: Partial<PlayerInfo>): Promise<void>
  removeUser(id: Player['id']): Promise<void>
  getUser(id: Player['id']): Promise<PlayerInfo | undefined>

  onPlayerChange(cb: (id: Player['id'], playerInfo: PlayerInfo) => void): void
}
