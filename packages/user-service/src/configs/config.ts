import * as process from 'node:process'

export const config = {
  env: process.env.NODE_ENV ?? 'test',
  port: parseInt(process.env.PORT ?? '3000'),
  dbUri: process.env.DB_URI ?? 'mongodb://test:27017/test',
  corsAllowedOrigins: process.env.CORS_ALLOWED_ORIGINS?.split(',') || ['http://api-gateway:3000'],
}
