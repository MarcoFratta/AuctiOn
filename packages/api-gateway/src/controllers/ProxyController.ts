import { createProxyMiddleware, fixRequestBody } from 'http-proxy-middleware'
import { config } from '../configs/Config'
import { ServiceNotFoundError } from '../errors/LobbyErrors'
import { Request, Response } from 'express'
import logger from '@auction/common/logger'
import * as net from 'node:net'
import { Server, Socket } from 'socket.io'
import { io as ioClient } from 'socket.io-client'

export class ProxyController {
  createProxy(serviceName: string, ws = false) {
    const service = config.services[serviceName]

    if (!service) {
      throw new ServiceNotFoundError()
    }

    return createProxyMiddleware<Request, Response>({
      target: service.url,
      changeOrigin: true,
      ws: ws,
      logger: logger,
      pathRewrite: service.pathRewrite,
      on: {
        proxyReq: fixRequestBody,
        error: (err, req, res) => {
          logger.error(`Error proxying request: ${err}, request url: ${req.url}`)
          if (res instanceof net.Socket) {
            // Handle WebSocket errors
            res.end() // Close the socket connection
          } else if (!res.headersSent) {
            res.status(500).json({ error: `Service is unavailable` })
          }
        },
      },
    })
  }

  createWsProxy(io: Server) {
    // Forward WebSocket connection to Auction Service after authentication
    io.on('connection', (socket: Socket) => {
      const user = socket.handshake.auth.user
      logger.info(`[API Gateway] WebSocket connection authenticated for user: ${user.id}`)

      // Manually create a WebSocket connection to the Auction Service
      const auctionSocket = ioClient(config.services['auction'].url, {
        path: '/auction',
        transports: ['websocket'],
        auth: { user: user }, // Forward user data
      })

      // Forward messages between client and auction service
      socket.onAny((event, payload) => {
        logger.info(`[API Gateway] Forwarding event '${event}' for user ${user.id}`)
        auctionSocket.emit(event, payload)
      })
      auctionSocket.on('connection', () => {
        logger.info(`[API Gateway] Connected to Auction Service for user ${user.id}`)
      })
      auctionSocket.onAny((event, payload) => {
        socket.emit(event, payload)
      })
      socket.on('connect_error', err => {
        logger.error(`[API Gateway] WebSocket connection error: ${err}`)
      })

      // Handle disconnection
      socket.on('disconnect', reason => {
        logger.info(`[API Gateway] User ${user.id} disconnected
        with reason: ${reason}`)
        auctionSocket.disconnect()
      })
      auctionSocket.on('disconnect', reason => {
        logger.info(`[API Gateway] Auction Service disconnected for user ${user.id} 
        with reason: ${reason}`)
        socket.disconnect()
      })
      auctionSocket.on('connect_error', err => {
        logger.error(`[API Gateway] Auction Service connection error: ${err}`)
        socket.disconnect()
      })
    })
    io.on('connect_error', err => {
      logger.error(`[API Gateway] WebSocket server error: ${err}`)
    })
  }
}
