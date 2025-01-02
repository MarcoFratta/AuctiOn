<<<<<<< HEAD
import * as dotenv from 'dotenv'

dotenv.config({ path: '../../.env' })

export const config = {
    nodeEnv: process.env.NODE_ENV ?? 'development',
    port: process.env.PORT ?? 8080,
    authServiceUri: process.env.AUTH_SERVICE_URI ?? 'http://test-url:3001',
    userServiceUri: process.env.USER_SERVICE_URI ?? 'http://test-url:3002',
}
=======
import * as dotenv from 'dotenv';

dotenv.config({ path: '../../.env' });

export const config = {
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: process.env.PORT ?? 8080,
  authServiceUri: process.env.AUTH_SERVICE_URI ?? 'http://test-url:3001',
  userServiceUri: process.env.USER_SERVICE_URI ?? 'http://test-url:3002',
};
>>>>>>> c774751 (chore: fix project structure bug)
