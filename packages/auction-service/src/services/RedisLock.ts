import { randomUUID } from 'crypto'
import Redis from 'ioredis'
import AsyncLock from 'async-lock'

export class RedisLock {
  private redis: Redis
  private asyncLock: AsyncLock

  constructor(redis: Redis) {
    this.redis = redis
    this.asyncLock = new AsyncLock()
  }

  async runWithLock<T>(lockKey: string, ttlMs: number, task: () => Promise<T>, retryDelayMs = 100): Promise<T> {
    return this.asyncLock.acquire(lockKey, async () => {
      const lockId = await this.acquireDistributedLockWithRetry(lockKey, ttlMs, retryDelayMs)

      if (!lockId) {
        throw new Error(`Failed to acquire distributed lock for ${lockKey}`)
      }

      try {
        return await task()
      } finally {
        await this.releaseDistributedLock(lockKey, lockId)
      }
    })
  }

  private async acquireDistributedLockWithRetry(lockKey: string, ttlMs: number, retryDelayMs: number): Promise<string | null> {
    const lockId = randomUUID()

    while (true) {
      const success = await this.redis.set(lockKey, lockId, 'PX', ttlMs, 'NX')
      if (success) return lockId

      await new Promise(resolve => setTimeout(resolve, retryDelayMs))
    }
  }

  private async releaseDistributedLock(lockKey: string, lockId: string): Promise<void> {
    const luaScript = `
      if redis.call("GET", KEYS[1]) == ARGV[1]
      then
        return redis.call("DEL", KEYS[1])
      else
        return 0
      end
    `
    await this.redis.eval(luaScript, 1, lockKey, lockId)
  }
}
