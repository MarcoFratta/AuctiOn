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
    io.on('connection', (socket: Socket) => {
      const user = socket.handshake.auth.user
      if (!user || !user.id) {
        logger.debug('[API Gateway] WebSocket connection attempt without user info in auth. Disconnecting.')
        socket.disconnect(true)
        return
      }
      logger.debug(`[API Gateway] WebSocket connection authenticated for user: ${user.id}`)

      const auctionServiceUrl = config.services['auction']?.url
      if (!auctionServiceUrl) {
        logger.error('[API Gateway] Auction service URL not configured. Disconnecting client.')
        socket.disconnect(true)
        return
      }

      // Manually create a WebSocket connection to the Auction Service
      const auctionSocket = ioClient(auctionServiceUrl, {
        path: '/auction', // Ensure this path matches your auction service setup if needed
        transports: ['websocket'],
        auth: { user: user }, // Forward user data
        // Add reconnection options if desired
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      })

      // --- Forward messages from Client to Auction Service (with Ack handling) ---
      socket.onAny((event, ...args) => {
        // Check if the last argument is a function (the acknowledgement callback)
        const ack = typeof args[args.length - 1] === 'function' ? args.pop() : undefined
        if (ack) {
          // If there's an ack, forward the event, args, and a *new* callback
          // that will call the original client's ack when the auction service responds.
          auctionSocket.emit(event, ...args, (...responseArgs: unknown[]) => {
            try {
              ack(...responseArgs) // Call the original client's callback
            } catch (e) {
              logger.debug(`[API Gateway] Error executing client ack callback for event '${event}':`, e)
            }
          })
        } else {
          // If no ack, just forward the event and arguments
          auctionSocket.emit(event, ...args)
        }
      })
      // --- End Forward Client to Auction Service ---

      // --- Forward messages from Auction Service to Client ---
      auctionSocket.onAny((event, ...args) => {
        // Check for acknowledgement from auction service (less common, but possible)
        const ack = typeof args[args.length - 1] === 'function' ? args.pop() : undefined
        if (ack) {
          socket.emit(event, ...args, (...responseArgs: unknown[]) => {
            try {
              ack(...responseArgs) // Call the auction service's callback
            } catch (e) {
              logger.debug(`[API Gateway] Error executing auction service ack callback for event '${event}':`, e)
            }
          })
        } else {
          socket.emit(event, ...args)
        }
      })
      // --- End Forward Auction Service to Client ---

      // --- Connection Handling ---
      auctionSocket.on('connect', () => {
        // Changed from 'connection' to 'connect' for client
        logger.debug(`[API Gateway] Successfully connected to Auction Service WS for user ${user.id}`)
      })

      socket.on('disconnect', reason => {
        logger.debug(`[API Gateway] Client disconnected: User ${user.id}. Reason: ${reason}. Disconnecting from Auction Service.`)
        auctionSocket.disconnect()
      })

      auctionSocket.on('disconnect', reason => {
        logger.debug(`[API Gateway] Disconnected from Auction Service for user ${user.id}. Reason: ${reason}. Disconnecting client.`)
        // Avoid potential infinite loop if disconnects trigger each other rapidly
        if (socket.connected) {
          socket.disconnect()
        }
      })

      auctionSocket.on('connect_error', err => {
        logger.debug(`[API Gateway] Auction Service connection error for user ${user.id}: ${err.message}. Disconnecting client.`)
        if (socket.connected) {
          socket.disconnect()
        }
      })

      // Optional: Handle errors on the client-facing socket too
      socket.on('error', err => {
        logger.debug(`[API Gateway] Error on client socket for user ${user.id}: ${err.message}`)
        // Consider disconnecting both sides on error
        if (auctionSocket.connected) auctionSocket.disconnect()
        if (socket.connected) socket.disconnect()
      })
      // --- End Connection Handling ---
    })

    // Handle errors on the main IO server instance (e.g., initial connection errors)
    io.engine.on('connection_error', err => {
      logger.error(`[API Gateway] Main WS Server Connection Error - Code: ${err.code}, Message: ${err.message}, Context: ${err.context}`)
    })
  }
}
