import WebSocket, { Server } from 'ws'
import { createServer } from 'http'
import { WebSocketAdapter } from '../src/adapters/WebSocketAdapter'
import logger from '../src/utils/Logger'

describe('WebSocket Server', () => {
  let server: Server
  let httpServer: any
  let adapter: WebSocketAdapter
  let port: number

  beforeEach(done => {
    // Set up the HTTP server and WebSocket server before each test
    httpServer = createServer()
    adapter = new WebSocketAdapter({ server: httpServer })
    server = adapter.getServer()

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
    const ws = new WebSocket(`ws://localhost:${port}/player1`)

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
      adapter.onPlayerMessage((playerId, message) => {
        expect(playerId).toBe('player1')
        expect(JSON.parse(message)).toEqual({ type: 'bid', bid: { amount: 100, round: 1 } })
        resolve()
      })
    })

    ws.close()
  })

  it('should handle player connection', async () => {
    adapter.onPlayerConnect((playerId: string) => {
      expect(playerId).toBe('player1')
    })

    const ws = new WebSocket(`ws://localhost:${port}/player1`)

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
    await new Promise<void>((resolve, reject) => {
      adapter.onPlayerDisconnect((playerId: string) => {
        expect(playerId).toBe('player1')
        resolve()
      })

      const ws = new WebSocket(`ws://localhost:${port}/player1`)
      ws.on('open', () => {
        ws.close()
      })
      ws.on('error', reject)
    })
  })
})
