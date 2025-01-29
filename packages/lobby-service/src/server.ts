import { App } from './App'
import dotenv from 'dotenv'
import { Kafka } from 'kafkajs'
import logger from './utils/Logger'
import { connectToDatabase } from './utils/MongoDB'

dotenv.config()

const port = process.env.PORT ? parseInt(process.env.PORT) : 3000
const kafkaBrokers = process.env.KAFKA_BROKERS ? process.env.KAFKA_BROKERS.split(',') : ['localhost:9092']

async function startServer() {
  try {
    const kafka = new Kafka({
      clientId: 'lobby-service',
      brokers: kafkaBrokers,
    })
    const app = new App(kafka)
    await app.start(port)

    // Handle shutdown gracefully
    process.on('SIGTERM', async () => {
      console.log('SIGTERM signal received. Closing server...')
      await app.stop()
      process.exit(0)
    })

    process.on('SIGINT', async () => {
      console.log('SIGINT signal received. Closing server...')
      await app.stop()
      process.exit(0)
    })

    await connectToDatabase().then(() => {
      logger.info('Connected to database successfully')
    })
  } catch (error) {
    console.error('Failed to start server:', error)
    process.exit(1)
  }
}

startServer().then(() => {
  logger.info(`Server started successfully on port ${port}`)
})
