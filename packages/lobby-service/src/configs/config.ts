<<<<<<< HEAD
import * as dotenv from 'dotenv'

dotenv.config({ path: '../../.env' })

export const config = {
    port: process.env.PORT ?? 3000,
    dbUri: process.env.DB_URI ?? 'mongodb://test:27017/test',
    userServiceUrl: process.env.USER_SERVICE_URI ?? 'http://test-url:3001',
    authServiceUri: process.env.AUTH_SERVICE_URI ?? 'http://test-url:3002',
    jwtSecret: process.env.JWT_SECRET ?? 'test-secret',
}
=======
import * as dotenv from 'dotenv';

dotenv.config({ path: '../../.env' });

export const config = {
  port: process.env.PORT ?? 3000,
  dbUri: process.env.DB_URI ?? 'mongodb://test:27017/test',
  userServiceUrl: process.env.USER_SERVICE_URI ?? 'http://test-url:3001',
  authServiceUri: process.env.AUTH_SERVICE_URI ?? 'http://test-url:3002',
  jwtSecret: process.env.JWT_SECRET ?? 'test-secret',
};
>>>>>>> c774751 (chore: fix project structure bug)
