export const config = {
  port: process.env.PORT ?? 3000,
  dbUri: process.env.DB_URI ?? 'mongodb://localhost:27017',
}
