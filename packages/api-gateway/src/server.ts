import app, { routes } from './App'
import { config } from './configs/Config'
import logger from '@auction/common/logger'
import * as net from 'node:net'
import { WSAuthMiddleware } from './middlewares/AuthMiddleware'

const port = config.port

const server = app.listen(port, () => {
  logger.info(`API Gateway running on port ${port}`)
  logger.info(config.services)
})

server.on('upgrade', (req, socket: net.Socket, head) => {
  logger.info(`Upgrading request: ${req.url}`)
  if (req.url?.indexOf('/auction') === 0) {
    WSAuthMiddleware(req).then(isAuth => {
      if (!isAuth) {
        logger.error('User not authenticated')
        socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n')
        socket.destroy()
        return
      }
      logger.info('User authenticated')
      routes.auctionWsPros.upgrade(req, socket, head)
    })
  }
})
