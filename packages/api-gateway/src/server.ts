import app from './App'
import { config } from './configs/Config'
import logger from '@auction/common/logger'
import { createServer } from 'http'
import { createWsServer } from './WsApp'

const port = config.port

const server = createServer(app)
const _ = createWsServer(server)

server.listen(port, () => {
  logger.info(`API Gateway running on port ${port}`)
  logger.info(config.services)
})
