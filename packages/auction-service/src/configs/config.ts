export const config = {
  env: process.env.NODE_ENV ?? 'test',
  port: process.env.PORT ?? 3000,
  kafkaBrokers: (process.env.KAFKA_BROKERS ?? 'localhost:9092').split(','),
}
