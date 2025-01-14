import WebSocket, { Server } from 'ws'
import { createServer } from 'http'
import { WebSocketAdapter } from '../src/adapters/WebSocketAdapter'
import logger from '../src/utils/Logger'

describe('WebSocket Server', () => {
  let server: Server
  let httpServer: any

  beforeEach(done => {
    // Set up the HTTP server and WebSocket server before each test
    httpServer = createServer()
    const adapter = new WebSocketAdapter({ server: httpServer })
    server = adapter.getServer()

    httpServer.listen(8080, () => {
      done()
    })
  })

  afterEach(done => {
    // Close WebSocket server and HTTP server after each test
    server.close(() => {
      httpServer.close(done)
    })
  })

  it('should allow clients to connect', async () => {
    const ws = new WebSocket('ws://localhost:8080')

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
})
