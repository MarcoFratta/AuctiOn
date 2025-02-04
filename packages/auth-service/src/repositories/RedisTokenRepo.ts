import { TokensRepo } from './TokensRepo'
import Redis from 'ioredis'
import logger from '@auction/common/logger'

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
      logger.info(`Saved reset token for user: ${userId}`)
    } catch (error) {
      logger.error(`Error saving reset token for user ${userId}: ${error}`)
      throw error
    }
  }

  async findResetToken(userId: string): Promise<string | null> {
    try {
      const key = `resetToken:${userId}`
      const storedToken = await this.redisClient.get(key)
      logger.info(`Found reset token for key: ${key}`)
      return storedToken
    } catch (error) {
      logger.error(`Error finding reset token of ${userId}: ${error}`)
      throw error
    }
  }

  async deleteResetToken(userId: string): Promise<void> {
    try {
      const key = `resetToken:${userId}`
      await this.redisClient.del(key)
    } catch (error) {
      logger.error(`Error deleting refresh token of ${userId}: ${error}`)
      throw error
    }
  }

  async saveRefreshToken(token: string, userId: string): Promise<void> {
    try {
      const key = `refreshToken:${userId}`
      await this.redisClient.set(key, token, 'EX', 60 * 60 * 24 * this.refreshExpDays) // Set expiration to 7 days
      logger.info(`Saved refresh token for user: ${userId}`)
    } catch (error) {
      logger.error(`Error saving refresh token for user ${userId}: ${error}`)
      throw error
    }
  }

  async deleteRefreshToken(userId: string): Promise<void> {
    try {
      const key = `refreshToken:${userId}`
      await this.redisClient.del(key)
    } catch (error) {
      logger.error(`Error deleting refresh token of ${userId}: ${error}`)
      throw error
    }
  }

  async findRefreshToken(userId: string): Promise<string | null> {
    try {
      const key = `refreshToken:${userId}`
      const storedToken = await this.redisClient.get(key)
      logger.info(`Found refresh token for key: ${key}`)
      return storedToken
    } catch (error) {
      logger.error(`Error finding refresh token of ${userId}: ${error}`)
      throw error
    }
  }
}
