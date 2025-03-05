import { UserService } from './UserService'
import { Player, PlayerInfo } from '../schemas/Player'
import { Redis } from 'ioredis'

export class UserServiceImpl implements UserService {
  private readonly redisKeyPrefix = 'user:'

  constructor(private readonly redis: Redis) {}

  async addUser(id: Player['id'], info: PlayerInfo): Promise<void> {
    await this.redis.set(this.getKey(id), JSON.stringify(info))
  }

  async removeUser(id: Player['id']): Promise<void> {
    await this.redis.del(this.getKey(id))
  }

  async getUser(id: Player['id']): Promise<PlayerInfo | undefined> {
    const data = await this.redis.get(this.getKey(id))
    if (!data) return undefined
    return JSON.parse(data) as PlayerInfo
  }

  private getKey(id: string): string {
    return `${this.redisKeyPrefix}${id}`
  }
}
