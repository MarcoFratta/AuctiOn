import WebSocket, { Server } from 'ws'
import { createServer } from 'http'
import { WebSocketAdapter } from '../src/adapters/WebSocketAdapter'
import logger from '../src/utils/Logger'
import { AuthenticatedRequest, authMiddleware } from '../src/middlewares/AuthMiddleware'
import { UserNotAuthenticatedError } from '../src/errors/Errors'
import { Duplex } from 'stream'

describe('WebSocket Server', () => {
  let server: Server
  let httpServer: any
  let adapter: WebSocketAdapter
  let port: number

  beforeEach(done => {
    // Set up the HTTP server and WebSocket server before each test
    httpServer = createServer()
    adapter = new WebSocketAdapter({ noServer: true })
    server = adapter.getServer()

    httpServer.on('upgrade', async (req: AuthenticatedRequest, socket: Duplex, head: Buffer<ArrayBufferLike>) => {
      try {
        logger.info(`Authenticating request: ${req.url}`)
        const authenticated = authMiddleware(req)
        if (!authenticated) {
          throw new UserNotAuthenticatedError()
        }
        // If auth successful, proceed with WebSocket using existing adapter
        adapter.getServer().handleUpgrade(req, socket, head, ws => {
          adapter.getServer().emit('connection', ws, req)
        })
      } catch (err) {
        socket.destroy()
        logger.error('WebSocket authentication error:', err)
        throw new Error('WebSocket authentication error')
      }
    })

    httpServer.listen(0, () => {
      const address = httpServer.address()
      if (address && typeof address === 'object') {
        port = address.port // Save the dynamically assigned port
        logger.info(`Test server started on port ${port}`)
        done()
      } else {
        done(new Error('Failed to assign a dynamic port'))
      }
    })
  })

  afterEach(done => {
    // Close WebSocket server and HTTP server after each test
    server.close(() => {
      httpServer.close(done)
    })
  })

  it('should allow clients to connect', async () => {
    const playerId = 'player1'
    const ws = new WebSocket(`ws://localhost:${port}/player1`)

    // Wait for the connection to open
    await new Promise<void>((resolve, reject) => {
      ws.on('open', () => {
        logger.info('Client connected')
        resolve()
      })

      ws.on('error', err => {
        logger.error('WebSocket error:', err)
        reject(err)
      })
    })
    ws.close()
    // Perform assertions after the connection is established
    expect(server.clients.size).toBe(1)
  })

  it('should send and receive messages correctly', async () => {
    const playerId = 'player1'
    const ws = new WebSocket(`ws://localhost:${port}/player1`, {
      headers: {
        user: JSON.stringify({ id: playerId, email: 'test@example.com', name: 'Test Player' }),
      },
    })

    await new Promise<void>((resolve, reject) => {
      ws.on('open', () => {
        logger.info('Client connected')
        ws.send(JSON.stringify({ type: 'bid', bid: { amount: 100, round: 1 } }))
        resolve()
      })

      ws.on('error', err => {
        logger.error('WebSocket error:', err)
        reject(err)
      })
    })

    await new Promise<void>((resolve, reject) => {
      adapter.onPlayerMessage((receivedPlayerId, message) => {
        expect(receivedPlayerId).toBe(playerId)
        expect(JSON.parse(message)).toEqual({ type: 'bid', bid: { amount: 100, round: 1 } })
        resolve()
      })
    })

    ws.close()
  })

  it('should handle player connection', async () => {
    const playerId = 'player1'
    adapter.onPlayerConnect((connectedPlayerId: string) => {
      expect(connectedPlayerId).toBe(playerId)
    })

    const ws = new WebSocket(`ws://localhost:${port}/player1`, {
      headers: {
        user: JSON.stringify({ id: playerId, email: 'test@example.com', name: 'Test Player' }),
      },
    })

    await new Promise<void>((resolve, reject) => {
      ws.on('open', () => {
        logger.info('Player connected')
        resolve()
      })

      ws.on('error', err => {
        logger.error('WebSocket error:', err)
        reject(err)
      })
    })

    ws.close()
  })

  it('should handle player disconnection', async () => {
    const playerId = 'player1'
    await new Promise<void>((resolve, reject) => {
      adapter.onPlayerDisconnect((disconnectedPlayerId: string) => {
        expect(disconnectedPlayerId).toBe(playerId)
        resolve()
      })

      const ws = new WebSocket(`ws://localhost:${port}/player1`, {
        headers: {
          user: JSON.stringify({ id: playerId, email: 'test@example.com', name: 'Test Player' }),
        },
      })
      ws.on('open', () => {
        ws.close()
      })
      ws.on('error', reject)
    })
  })
})
