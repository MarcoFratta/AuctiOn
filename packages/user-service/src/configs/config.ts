import * as dotenv from 'dotenv';

if (process.env.NODE_ENV === 'test' || process.env.NODE_ENV === 'development') {
  dotenv.config({ path: '../../../../.env' });
}

export const config = {
  port: process.env.PORT ?? 3000,
  dbUri: process.env.DB_URI ?? 'mongodb://localhost:27017',
};
