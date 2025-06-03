import { Server } from 'socket.io'
import { handleWsAuth } from './middlewares/AuthMiddleware'
import { ProxyController } from './controllers/ProxyController'
import * as http from 'node:http'
import { config } from './configs/Config'

export function createWsServer(server: http.Server) {
  const io = new Server(server, {
    path: '/auction',
    cors: {
      origin: config.corsAllowedOrigins,
      methods: ['GET', 'POST'],
    },
  })
  handleWsAuth(io)
  new ProxyController().createWsProxy(io)
  return io
}
