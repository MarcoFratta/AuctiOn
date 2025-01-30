import { Redis } from 'ioredis'
import App from './App'
import { config } from './configs/config'
import logger from './utils/Logger'
import { connectToDatabase } from './utils/MongoDB'

const redis = new Redis('redis://localhost:6379') //Adjust the Redis connection string as needed
const app = new App(redis)
const port = config.port || 3000

connectToDatabase()
  .then(() => {
    app.start(port)
  })
  .catch(error => {
    logger.error('Failed to start server due to database connection error:', error)
  })
