import * as process from 'node:process'

export const config = {
  env: process.env.NODE_ENV ?? 'test',
  port: parseInt(process.env.PORT ?? '3000'),
  kafkaBrokers: (process.env.KAFKA_BROKERS ?? 'localhost:9092').split(','),
  redisUrl: process.env.REDIS_URL ?? 'redis://localhost:6379',
  redisPort: parseInt(process.env.REDIS_PORT ?? '6379'),
  healthPort: 3006,
  corsAllowedOrigins: process.env.CORS_ALLOWED_ORIGINS?.split(',') || ['http://api-gateway:3000'],
}
