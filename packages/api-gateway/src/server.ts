import app from './App'
import { config } from './configs/Config'
import logger from '@auction/common/logger'
import { handleWsAuth } from './middlewares/AuthMiddleware'
import WebSocket from 'ws'

const port = config.port

const server = app.listen(port, () => {
  logger.info(`API Gateway running on port ${port}`)
  logger.info(config.services)
})
const wss = new WebSocket.Server({ server, path: '/auctions' })
handleWsAuth(wss)
