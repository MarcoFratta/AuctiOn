import { Redis } from 'ioredis'
import logger from '@auction/common/logger'

export interface TimerRepo {
  saveTimer(auctionId: string, startTime: number, duration: number): Promise<void>

  getTimer(auctionId: string): Promise<number | null>

  removeTimer(auctionId: string): Promise<void>

  getAllTimers(): Promise<Map<string, number>>
}

export class RedisTimerRepo implements TimerRepo {
  private readonly TIMER_PREFIX = 'timers:'

  constructor(private readonly redis: Redis) {}

  async saveTimer(auctionId: string, startTime: number, duration: number): Promise<void> {
    const key = this.getTimerKey(auctionId)
    const timerData = JSON.stringify({ startTime, duration })

    // Set the timer data with TTL equal to the duration (in seconds)
    // This ensures the timer is automatically removed when it expires
    await this.redis.set(key, timerData, 'EX', duration)
    logger.debug(`Saved timer for auction ${auctionId} with TTL ${duration}s`)
  }

  async getTimer(auctionId: string): Promise<number | null> {
    const key = this.getTimerKey(auctionId)
    const timerData = await this.redis.get(key)

    if (!timerData) {
      return null
    }

    return JSON.parse(timerData)
  }

  async removeTimer(auctionId: string): Promise<void> {
    const key = this.getTimerKey(auctionId)
    await this.redis.del(key)
    logger.debug(`Removed timer for auction ${auctionId}`)
  }

  async getAllTimers(): Promise<Map<string, number>> {
    const keys = await this.redis.keys(`${this.TIMER_PREFIX}*`)
    const result = new Map<string, number>()

    if (keys.length === 0) {
      return result
    }

    const values = await this.redis.mget(keys)

    keys.forEach((key, index) => {
      const value = values[index]
      if (value) {
        const auctionId = key.substring(this.TIMER_PREFIX.length)
        result.set(auctionId, JSON.parse(value))
      }
    })

    return result
  }

  private getTimerKey(auctionId: string): string {
    return `${this.TIMER_PREFIX}${auctionId}`
  }
}
