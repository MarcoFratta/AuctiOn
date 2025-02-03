export const config = {
  env: process.env.NODE_ENV ?? 'test',
  port: parseInt(process.env.PORT ?? '3000'),
  dbUri: process.env.DB_URI ?? 'mongodb://test:27017/test',
  userServiceUrl: process.env.USER_SERVICE_URI ?? 'http://test-url:3001',
  authServiceUri: process.env.AUTH_SERVICE_URI ?? 'http://test-url:3002',
  kafkaBrokers: process.env.KAFKA_BROKERS?.split(',') ?? ['localhost:9092'],
}
