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
      await this.redisClient.set(key, token, 'EX', 60 * this.resetExpMinutes)
    } catch (error) {
      throw error
    }
  }

  async findResetToken(userId: string): Promise<string | null> {
    try {
      const key = `resetToken:${userId}`
      return await this.redisClient.get(key)
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
      return await this.redisClient.get(key)
    } catch (error) {
      throw error
    }
  }

  async blacklistToken(token: string, expiresAt: number): Promise<void> {
    try {
      // Calculate TTL in seconds (how long until token expires)
      const now = Math.floor(Date.now() / 1000)
      const ttl = expiresAt - now

      if (ttl <= 0) {
        // Token already expired, no need to blacklist
        return
      }

      // Store in blacklist with expiration matching the token's expiration
      const key = `blacklist:${token}`
      await this.redisClient.set(key, '1', 'EX', ttl)
    } catch (error) {
      throw error
    }
  }

  async isTokenBlacklisted(token: string): Promise<boolean> {
    try {
      const key = `blacklist:${token}`
      const exists = await this.redisClient.exists(key)
      return exists === 1
    } catch (error) {
      throw error
    }
  }
}
