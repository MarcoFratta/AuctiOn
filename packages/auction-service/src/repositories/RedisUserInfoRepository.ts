import { Redis } from 'ioredis'
import { UserInfoRepository } from './UserInfoRepository'
import { PlayerInfo } from '../schemas/Player'

export class RedisUserInfoRepository implements UserInfoRepository {
  private readonly redisKeyPrefix = 'user:'

  constructor(private readonly redis: Redis) {}

  async addUser(id: string, info: PlayerInfo): Promise<void> {
    await this.redis.set(this.getKey(id), JSON.stringify(info))
  }

  async removeUser(id: string): Promise<void> {
    await this.redis.del(this.getKey(id))
  }

  async getUser(id: string): Promise<PlayerInfo | undefined> {
    const data = await this.redis.get(this.getKey(id))
    if (!data) return undefined
    return JSON.parse(data)
  }

  async updateUser(id: string, info: Partial<PlayerInfo>): Promise<void> {
    const data = await this.getUser(id)
    if (!data) return
    await this.redis.set(this.getKey(id), JSON.stringify({ ...data, ...info }))
  }

  private getKey(id: string): string {
    return `${this.redisKeyPrefix}${id}`
  }
}
