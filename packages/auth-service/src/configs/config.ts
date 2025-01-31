import * as process from 'node:process'

export const config = {
  env: process.env.NODE_ENV ?? 'test',
  port: parseInt(process.env.PORT ?? '3000'),
  dbUri: process.env.DB_URI ?? 'mongodb://test:27017/test',
  userServiceUrl: process.env.USER_SERVICE_URI ?? 'http://test-url:3001',
  accessTokenSecret: process.env.JWT_ACCESS_SECRET ?? 'test-secret',
  refreshTokenSecret: process.env.JWT_REFRESH_SECRET ?? 'test-secret2',
  resetTokenSecret: process.env.JWT_RESET_SECRET ?? 'test-secret3',
  redisHost: process.env.REDIS_URL ?? 'localhost',
  redisPort: parseInt(process.env.REDIS_PORT ?? '6379'),
  accessTokenExpireMinutes: parseInt(process.env.ACCESS_EXPIRATION_MINUTES ?? '15'),
  refreshTokenExpireDays: parseInt(process.env.REFRESH_EXPIRATION_DAYS ?? '7'),
  resetTokenExpireMinutes: parseInt(process.env.RESET_EXPIRATION_MINUTES ?? '15'),
  emailUser: process.env.EMAIL_USER ?? 'test-user',
  emailPass: process.env.EMAIL_PASS ?? 'test-pass',
}
