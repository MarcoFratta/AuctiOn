import * as process from 'node:process'

export const config = {
  port: parseInt(process.env.PORT ?? '3000'),
  dbUri: process.env.DB_URI ?? 'mongodb://test:27017/test',
  userServiceUrl: process.env.USER_SERVICE_URI ?? 'http://test-url:3001',
  jwtAccessSecret: process.env.JWT_ACCESS_SECRET ?? 'test-secret',
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET ?? 'test-secret2',
  redisHost: process.env.REDIS_HOST ?? 'localhost',
  redisPort: parseInt(process.env.REDIS_PORT ?? '6379'),
  refreshTokenExpireDays: parseInt(process.env.REFRESH_TOKEN_EXPIRE_DAYS ?? '7'),
}
