import { TokensRepo } from './TokensRepo'
import Redis from 'ioredis'

export class RedisTokenRepo implements TokensRepo {
  private redisClient: Redis

  constructor(
    redis: Redis,
    private readonly refreshExpDays: number,
    private readonly resetExpMinutes: number
  ) {
    this.redisClient = redis
  }

  async saveResetToken(token: string, userId: string): Promise<void> {
    try {
      const key = `resetToken:${userId}`
      await this.redisClient.set(key, token, 'EX', 60 * this.resetExpMinutes) // Set expiration to 7 days
    } catch (error) {
      throw error
    }
  }

  async findResetToken(userId: string): Promise<string | null> {
    try {
      const key = `resetToken:${userId}`
      const storedToken = await this.redisClient.get(key)
      return storedToken
    } catch (error) {
      throw error
    }
  }

  async deleteResetToken(userId: string): Promise<void> {
    try {
      const key = `resetToken:${userId}`
      await this.redisClient.del(key)
    } catch (error) {
      throw error
    }
  }

  async saveRefreshToken(token: string, userId: string): Promise<void> {
    try {
      const key = `refreshToken:${userId}`
      await this.redisClient.set(key, token, 'EX', 60 * 60 * 24 * this.refreshExpDays) // Set expiration to 7 days
    } catch (error) {
      throw error
    }
  }

  async deleteRefreshToken(userId: string): Promise<void> {
    try {
      const key = `refreshToken:${userId}`
      await this.redisClient.del(key)
    } catch (error) {
      throw error
    }
  }

  async findRefreshToken(userId: string): Promise<string | null> {
    try {
      const key = `refreshToken:${userId}`
      const storedToken = await this.redisClient.get(key)
      return storedToken
    } catch (error) {
      throw error
    }
  }
}
