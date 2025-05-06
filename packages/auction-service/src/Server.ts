import { App } from './App'
import logger from '@auction/common/logger'
import { config } from './configs/config'
import { Kafka } from 'kafkajs'
import { connectRedis, createRedisInstance } from '@auction/common/redis'
import { RedisLock } from './services/RedisLock'

const PORT = config.port
const KAFKA_BROKERS = config.kafkaBrokers
const REDIS_URL = config.redisUrl
const REDIS_PORT = config.redisPort

// Create Kafka client
const kafka = new Kafka({
  clientId: 'auction-service',
  brokers: KAFKA_BROKERS,
})

// Create Redis client
const redis = createRedisInstance(REDIS_URL, REDIS_PORT)

// Create Redlock instance with the Redis client
const redlock = new RedisLock(redis)

connectRedis(redis).then(() => {
  // Create app with Kafka, Redis, and Redlock
  const app = new App(kafka, redis, redlock)

  app.start(PORT).catch(error => {
    logger.error('Failed to start server:', error)
    process.exit(1)
  })

  // Handle graceful shutdown
  process.on('SIGTERM', () => {
    app.stop().then(() => process.exit(0))
  })
})
