import { Server } from 'http'
import { Server as IoServer } from 'socket.io'
import { io } from 'socket.io-client'
import { WebSocketAdapter } from '../src/adapters/WebSocketAdapter'
import logger from '@auction/common/logger'

describe('WebSocketAdapter (Socket.IO)', () => {
  let httpServer: Server
  let adapter: WebSocketAdapter
  let ioServer: IoServer
  let port: number

  function startServer(done: jest.DoneCallback) {
    httpServer = new Server()

    httpServer.listen(() => {
      const address = httpServer.address()
      if (typeof address !== 'string' && address) {
        port = address.port
        ioServer = new IoServer(httpServer)

        logger.info(`Test Socket.IO server started on port ${port}`)
        ioServer.use((socket, next) => {
          logger.info(`New Socket.IO connection with player: ${socket.handshake.auth.token}`)
          socket.handshake.auth.user = { id: socket.handshake.auth.token }
          next()
        })
        ioServer.on('connection', (socket) => {
          logger.info(`New Socket.IO connection with player: ${socket.handshake.auth.token}`)
        })
        adapter = new WebSocketAdapter(ioServer)
        done()
      } else {
        done(new Error('Failed to assign a dynamic port'))
      }
    })
  }

  afterAll((done) => {
    if (httpServer) {
      httpServer.close(done)

    } else {
      done()
    }
  })

  beforeAll((done) => {
    startServer(done)
  })
  afterEach((done) => {
    if (ioServer) {
      ioServer.close().then(() => startServer(done))
    } else {
      startServer(done)
    }
  })

  test('should allow clients to connect', (done) => {
    const client = io(`http://localhost:${port}`, {
      auth: { token: 'player1' },
    })

    client.on('connect', () => {
      logger.info('Client connected')
      expect(client.connected).toBe(true)
      client.close()
      done()
    })
    client.on('error', (err) => {
      done(err)
    })
  });

  test('should send and receive messages correctly', (done) => {
    const client = io(`http://localhost:${port}`, {
      auth: { token: 'player1' },
    })

    client.on('connect', () => {
      client.emit('bid', { amount: 100, round: 1 })
    })

    adapter.onPlayerMessage((playerId, message) => {
      expect(playerId).toBe('player1')
      expect(message.type).toBe('bid')
      expect({ ...message, type: undefined }).toEqual({ amount: 100, round: 1 })
      client.close()
      done()
    })
  });

  test('should handle player connection event', (done) => {
    adapter.onPlayerConnect((playerId) => {
      expect(playerId).toBe('player2')
      done()
    })

    io(`http://localhost:${port}`, {
      auth: { token: 'player2' },
    })
  });

  test('should handle player disconnection', (done) => {


    adapter.onPlayerDisconnect((playerId) => {
      expect(playerId).toBe('player3')
      done()
    })
    const client = io(`http://localhost:${port}`, {
      auth: { token: 'player3' },
      reconnection: false,
    })

    client.on('connect', () => {
      client.close()
    })
  });
});
