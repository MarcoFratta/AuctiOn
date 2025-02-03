import { App } from './App'
import { Kafka } from 'kafkajs'
import logger from '@auction/common/logger'
import { connectMongo } from '@auction/common/mongo'
import { config } from './configs/config'

const port = config.port
const kafkaBrokers = config.kafkaBrokers

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

    await connectMongo(config.dbUri).then(() => {
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
