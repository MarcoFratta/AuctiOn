import { Redis } from 'ioredis'
import logger from '../logger/Logger'

export const createRedisInstance = (url: string, port: number): Redis => {
  return new Redis(port, url, {
    lazyConnect: true,
  })
}

export const connectRedis = async (redis: Redis): Promise<void> => {
  logger.info(`Connecting to Redis at ${redis.options.host}:${redis.options.port}...`)
  await redis.connect()
  logger.info(`Connected to Redis at ${redis.options.host}:${redis.options.port}`)
}
