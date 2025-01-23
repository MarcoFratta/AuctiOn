import { App } from './App'
import logger from './utils/Logger'

const PORT = parseInt(process.env.PORT || '3000', 10)
const KAFKA_BROKERS = (process.env.KAFKA_BROKERS || 'localhost:9092').split(',')
const app = new App(KAFKA_BROKERS)

app.start(PORT).catch(error => {
  logger.error('Failed to start server:', error)
  process.exit(1)
})

// Handle graceful shutdown
process.on('SIGTERM', () => {
  app.stop().then(() => process.exit(0))
})
