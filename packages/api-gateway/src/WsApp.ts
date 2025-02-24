import { Server } from 'socket.io'
import { handleWsAuth } from './middlewares/AuthMiddleware'
import { ProxyController } from './controllers/ProxyController'
import * as http from 'node:http'

export function createWsServer(server: http.Server) {
  const io = new Server(server, {
    path: '/auction',
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
  })
  handleWsAuth(io)
  new ProxyController().createWsProxy(io)
  return io
}
