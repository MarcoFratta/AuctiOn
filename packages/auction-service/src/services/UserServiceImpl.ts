import { UserService } from './UserService'
import { Player, PlayerInfo } from '../schemas/Player'
import { Redis } from 'ioredis'

export class UserServiceImpl implements UserService {
  private readonly redisKeyPrefix = 'user:'
  private callbacks: ((id: Player['id'], playerInfo: PlayerInfo) => void)[] = []

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

  async updateUser(id: Player['id'], info: Partial<PlayerInfo>): Promise<void> {
    const data = await this.getUser(id)
    if (!data) return
    await this.redis.set(this.getKey(id), JSON.stringify({ ...data, ...info }))
    this.callbacks.forEach(cb => cb(id, { ...data, ...info }))
  }

  onPlayerChange(cb: (id: Player['id'], playerInfo: PlayerInfo) => void): void {
    this.callbacks.push(cb)
  }

  private getKey(id: string): string {
    return `${this.redisKeyPrefix}${id}`
  }
}
