import { UserService } from './UserService'
import { Player, PlayerInfo } from '../schemas/Player'
import { UserInfoRepository } from '../repositories/UserInfoRepository'

export class UserServiceImpl implements UserService {
  private callbacks: ((id: Player['id'], playerInfo: PlayerInfo) => void)[] = []

  constructor(private readonly userInfoRepo: UserInfoRepository) {}

  async addUser(id: Player['id'], info: PlayerInfo): Promise<void> {
    await this.userInfoRepo.addUser(id, info)
  }

  async removeUser(id: Player['id']): Promise<void> {
    await this.userInfoRepo.removeUser(id)
  }

  async getUser(id: Player['id']): Promise<PlayerInfo | undefined> {
    return this.userInfoRepo.getUser(id)
  }

  async updateUser(id: Player['id'], info: Partial<PlayerInfo>): Promise<void> {
    const data = await this.getUser(id)
    if (!data) return
    await this.userInfoRepo.updateUser(id, info)
    this.callbacks.forEach(cb => cb(id, { ...data, ...info }))
  }

  onPlayerChange(cb: (id: Player['id'], playerInfo: PlayerInfo) => void): void {
    this.callbacks.push(cb)
  }
}
