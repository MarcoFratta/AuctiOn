import * as process from 'node:process'

export const config = {
  env: process.env.NODE_ENV ?? 'test',
  port: parseInt(process.env.PORT ?? '3000'),
  dbUri: process.env.DB_URI ?? 'mongodb://test:27017/test',
  userServiceUrl: process.env.USER_SERVICE_URI ?? 'http://test-url:3001',
  redisHost: process.env.REDIS_URI ?? 'redis://localhost',
  redisPort: parseInt(process.env.REDIS_PORT ?? '6379'),
  accessTokenSecret: process.env.ACCESS_TOKEN_SECRET ?? 'access',
  refreshTokenSecret: process.env.REFRESH_TOKEN_SECRET ?? 'refresh',
  resetTokenSecret: process.env.RESET_TOKEN_SECRET ?? 'reset',
  accessTokenExpireMinutes: parseInt(process.env.ACCESS_TOKEN_EXPIRE_MINUTES ?? '15'),
  refreshTokenExpireDays: parseInt(process.env.REFRESH_TOKEN_EXPIRE_DAYS ?? '7'),
  resetTokenExpireMinutes: parseInt(process.env.RESET_TOKEN_EXPIRE_MINUTES ?? '15'),
  emailHost: process.env.EMAIL_HOST ?? 'smtp.gmail.com',
  emailPort: parseInt(process.env.EMAIL_PORT ?? '587'),
  emailUser: process.env.EMAIL_USER ?? '',
  emailPass: process.env.EMAIL_PASS ?? '',
  corsAllowedOrigins: process.env.CORS_ALLOWED_ORIGINS?.split(',') || ['http://api-gateway:3000'],
}
