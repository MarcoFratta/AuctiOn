import App from './App'
import { config } from './configs/config'
import logger from '@auction/common/logger'
import { connectMongo } from '@auction/common/mongo'
import { connectRedis, createRedisInstance } from '@auction/common/redis'

const redis = createRedisInstance(config.redisHost, config.redisPort)
const app = new App(redis)
const port = config.port || 3000

Promise.all([connectMongo(config.dbUri), connectRedis(redis)])
  .then(() => {
    app.start(port)
  })
  .catch(error => {
    logger.error('Failed to start server due to database connection error:', error)
  })
