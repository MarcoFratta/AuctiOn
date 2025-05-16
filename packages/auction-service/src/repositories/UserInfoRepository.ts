import { PlayerInfo } from '../schemas/Player'

export interface UserInfoRepository {
  addUser(id: string, info: PlayerInfo): Promise<void>

  removeUser(id: string): Promise<void>

  getUser(id: string): Promise<PlayerInfo | undefined>

  updateUser(id: string, info: Partial<PlayerInfo>): Promise<void>
}
