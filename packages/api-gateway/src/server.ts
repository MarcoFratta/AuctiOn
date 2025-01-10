import app from './App'
import { config } from './configs/Config'
import logger from './utils/Logger'

const port = config.port

app.listen(port, () => {
  logger.info(`API Gateway running on port ${port}`)
  logger.info(config.services)
})
