import * as dotenv from 'dotenv';

if (process.env.NODE_ENV === 'test' || process.env.NODE_ENV === 'development') {
  dotenv.config({ path: '../../../../.env' });
}

export const config = {
  port: process.env.PORT ?? 3000,
  dbUri: process.env.DB_URI ?? 'mongodb://test:27017/test',
  userServiceUrl: process.env.USER_SERVICE_URI ?? 'http://test-url:3001',
  jwtSecret: process.env.JWT_SECRET ?? 'test-secret',
};
