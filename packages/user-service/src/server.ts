import { config } from './configs/config'
import { connectMongo } from '@auction/common/mongo'
import { App } from './App'
import logger from '@auction/common/dist/src/logger/Logger'

const port = config.port
const app = new App().app
connectMongo(config.dbUri)
  .then(() => {
    app.listen(port, () => {
      logger.info('Server is running on port 3000')
    })
  })
  .catch(error => {
    logger.error('Failed to start server due to database connection error:', error)
  })
