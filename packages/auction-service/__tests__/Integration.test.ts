import logger from '@auction/common/logger'
import { AuctionService } from '../src/services/AuctionService'
import { App } from '../src/App'
import { KafkaContainer, StartedKafkaContainer } from '@testcontainers/kafka'
import { Kafka } from 'kafkajs'
import { AuctionConfig } from '../src/schemas/Auction'
import redisMock from 'ioredis-mock'
import Redis from 'ioredis'
import { User } from '../src/schemas/User'
import { io, Socket } from 'socket.io-client'
import { RedisLock } from '../src/services/RedisLock'

jest.setTimeout(120 * 1000)
describe('Auction System Integration Test', () => {
  let service: AuctionService
  let port: number
  let app: App
  let kafka: StartedKafkaContainer
  let redis: Redis

  // Test data
  const defaultConfig: AuctionConfig = {
    id: 'auction1',
    maxPlayers: 4,
    creatorId: 'player1',
    maxRound: 3,
    startAmount: 100,
    startInventory: { items: [{ item: 'square', quantity: 2 }] },
    bidTime: 60,
  }

  beforeAll(async () => {
    // Start Kafka container
    kafka = await new KafkaContainer().withExposedPorts(9093).start()
    redis = new redisMock()
    await waitForKafkaToBeReady(kafka)

    // Start the application
    const kafkaBrokers = [`${kafka.getHost()}:${kafka.getMappedPort(9093)}`]
    app = new App(new Kafka({ brokers: kafkaBrokers, logLevel: 0 }), redis, new RedisLock(redis))
    service = app.auctionService

    await app.start(0) // Use port 0 to get a random available port

    const address = app.server.address()
    if (address && typeof address === 'object') {
      port = address.port
    } else {
      throw new Error('Failed to assign a dynamic port')
    }

    logger.info(`Server started on port ${port}`)
  })

  afterAll(async () => {
    await app.stop()
    await redis.flushall()
    await kafka.stop()
    redis.disconnect()
  })

  beforeEach(async () => {
    // Clear Redis before each test
    await redis.flushall()
  })

  async function waitForKafkaToBeReady(kafkaContainer: StartedKafkaContainer,
                                       retries: number = 10,
                                       delay: number = 2000) {
    const kafkaHost = `${kafkaContainer.getHost()}:${kafkaContainer.getMappedPort(9093)}`
    const admin = new Kafka({
      brokers: [kafkaHost],
      clientId: 'test',
      logLevel: 0,
    }).admin()

    for (let i = 0; i < retries; i++) {
      try {
        // Attempt to connect to the Kafka admin client
        await admin.connect()
        logger.info('Kafka is ready')

        // Create necessary topics if not already present
        await admin.createTopics({
          topics: [
            { topic: 'auction-events', numPartitions: 1 },
            { topic: 'player-events', numPartitions: 1 },
          ],
          waitForLeaders: true, // Ensure leaders are assigned to partitions
        })
        logger.info('Topics created successfully')
        await admin.disconnect()
        return
      } catch (error) {
        logger.warn(`Kafka not ready, retrying... (${i + 1}/${retries})`)
        await admin.disconnect()
        await new Promise(resolve => setTimeout(resolve, delay)) // Wait before retrying
      }
    }

    // If Kafka is still not ready after retries, throw an error
    throw new Error('Kafka did not become ready in time')
  }

  const connectPlayer = (
    player: Socket,
    user: User,
    messages: Record<string, any[]>,
  ) => {
    return new Promise<void>((resolve, reject) => {
      player.on('connect', () => {
        logger.info(`${user.id} connected`)
        resolve()
      })

      player.onAny((type: any, msg: any) => {
        logger.info(`[${user.id}:${type}]:${JSON.stringify(msg)}`)
        if (type === 'timer-start') {
          return // Ignore timer-start messages
        }
        if (!messages[user.id]) {
          messages[user.id] = []
        }
        messages[user.id].push({ ...msg, type })
      })

      player.on('connect_error', (err: any) => {
        logger.error(`Connection error for player ${user.id}:`, err)
        reject(err)
      })
    })
  }

  const bid = (amount: number, round: number) => {
    return {
      type: 'bid', bid: {
        amount,
        round,
      },
    }
  }

  const sale = (items: any[]) => {
    return { type: 'sell', sale: { items } }
  }

  async function waitToReceiveMessage() {
    await new Promise(resolve => setTimeout(resolve, 500))
  }

  async function waitToEndRound(auctionId: string) {
    await waitToReceiveMessage()
    await service.endRound(auctionId)
    await waitToReceiveMessage()
  }

  async function setupAuctionWithPlayers(auctionId: string, playerIds: string[]) {
    // Create a new auction config for this test
    const testConfig = {
      ...defaultConfig,
      id: auctionId,
    }

    // Create the auction
    await service.createAuction(testConfig)

    // Join players
    for (const playerId of playerIds) {
      await app['userService'].addUser(playerId, { username: playerId, status: 'ready' })
      await service.playerJoin(playerId, auctionId)
    }

    // Create socket connections
    const players: Record<string, Socket> = {}
    const messages: Record<string, any[]> = {}

    for (const playerId of playerIds) {
      players[playerId] = io(`http://localhost:${port}`, {
        path: '/auction',
        auth: { token: playerId },
      })
      messages[playerId] = []

      await connectPlayer(
        players[playerId],
        { id: playerId, name: playerId, email: `${playerId}@email.com` },
        messages,
      )
    }

    return { players, messages, config: testConfig }
  }

  async function cleanupPlayers(players: Record<string, Socket>) {
    // Close all socket connections
    for (const playerId in players) {
      players[playerId].close()
    }
  }

  it('should simulate a round with players', async () => {
    const auctionId = 'auction-round-test'
    const playerIds = ['player1', 'player2', 'player3']

    const { players, messages, config } = await setupAuctionWithPlayers(auctionId, playerIds)

    try {
      await service.startAuction(auctionId)

      // Player 1 starts a sale
      players.player1.emit('sell', sale([{ item: 'square', quantity: 1 }]))
      await waitToReceiveMessage()

      // Players 2 and 3 place bids
      players.player2.emit('bid', bid(50, 1))
      await waitToReceiveMessage()
      players.player3.emit('bid', bid(100, 1))
      await waitToReceiveMessage()

      expect(messages.player3.pop().bid).toEqual({
        amount: 100,
        round: 1,
        playerId: 'player3',
        timestamp: expect.any(String),
      })

      await service.endRound(auctionId)
      await waitToReceiveMessage()

      // Validate messages received by players
      expect(messages.player1.length).toBeGreaterThan(0) // Player 1 should receive updates
      expect(messages.player2.length).toBeGreaterThan(0) // Player 2 should receive updates

      expect(messages.player3[messages.player3.length - 1].playerInfo).toEqual({
        money: 0,
        inventory: { items: [{ item: 'square', quantity: 3 }] },
      })

      expect(messages.player1[messages.player1.length - 1].playerInfo).toEqual({
        money: 200,
        inventory: { items: [{ item: 'square', quantity: 1 }] },
      })
    } finally {
      await cleanupPlayers(players)
    }
  })

  it('should simulate a full match with players', async () => {
    const auctionId = 'auction-full-match'
    const playerIds = ['player1', 'player2', 'player3']

    const { players, messages, config } = await setupAuctionWithPlayers(auctionId, playerIds)

    try {
      await service.startAuction(auctionId)

      // Player 1 starts a sale
      players.player1.emit('sell', sale([{ item: 'square', quantity: 1 }]))
      await waitToReceiveMessage()

      // Players 2 and 3 place bids
      players.player2.emit('bid', bid(50, 1))
      await waitToReceiveMessage()
      players.player3.emit('bid', bid(55, 1))
      await waitToEndRound(auctionId)
      await waitToReceiveMessage()

      expect(messages.player3.pop().playerInfo).toEqual({
        money: 45,
        inventory: { items: [{ item: 'square', quantity: 3 }] },
      })

      expect(messages.player2.pop().playerInfo).toEqual({
        money: 100,
        inventory: { items: [{ item: 'square', quantity: 2 }] },
      })

      expect(messages.player1.pop().playerInfo).toEqual({
        money: 155,
        inventory: { items: [{ item: 'square', quantity: 1 }] },
      })

      // Player 2 starts a sale
      players.player2.emit('sell', sale([{ item: 'square', quantity: 1 }]))
      // no bids
      await waitToEndRound(auctionId)

      expect(messages.player3.pop().playerInfo).toEqual({
        money: 45,
        inventory: { items: [{ item: 'square', quantity: 3 }] },
      })

      expect(messages.player2.pop().playerInfo).toEqual({
        money: 100,
        inventory: { items: [{ item: 'square', quantity: 2 }] },
      })

      expect(messages.player1.pop().playerInfo).toEqual({
        money: 155,
        inventory: { items: [{ item: 'square', quantity: 1 }] },
      })

      // Player 3 starts a sale
      players.player3.emit('sell', sale([{ item: 'square', quantity: 1 }]))
      await waitToReceiveMessage()

      // Player 2 emits an old bid that should be ignored
      players.player2.emit('bid', bid(50, 2))

      // Player 1 and 2 place bids
      players.player1.emit('bid', bid(60, 3))
      await waitToReceiveMessage()
      players.player2.emit('bid', bid(70, 3))
      await waitToEndRound(auctionId)

      expect(messages.player2.pop().leaderboard).toEqual({
        leaderboard: [
          { id: 'player1', money: 155, inventory: { items: [{ item: 'square', quantity: 1 }] }, position: 1 },
          { id: 'player3', money: 115, inventory: { items: [{ item: 'square', quantity: 2 }] }, position: 2 },
        ],
        removed: [
          { id: 'player2', money: 40, inventory: { items: [{ item: 'square', quantity: 3 }] } },
        ],
      })
    } finally {
      await cleanupPlayers(players)
    }
  })

  it('should handle player disconnecting and reconnecting during their turn', async () => {
    const auctionId = 'auction-disconnect-reconnect'
    const playerIds = ['player1', 'player2', 'player3']

    // Create a custom config with triangle items
    const customConfig = {
      ...defaultConfig,
      id: auctionId,
      startInventory: { items: [{ item: 'triangle', quantity: 2 }] },
    } as AuctionConfig

    // Create the auction
    await service.createAuction(customConfig)

    // Join players
    for (const playerId of playerIds) {
      await service.playerJoin(playerId, auctionId)
    }

    // Create socket connections
    const players: Record<string, Socket> = {}
    const messages: Record<string, any[]> = {}

    for (const playerId of playerIds) {
      players[playerId] = io(`http://localhost:${port}`, {
        path: '/auction',
        auth: { token: playerId },
      })
      messages[playerId] = []

      await connectPlayer(
        players[playerId],
        { id: playerId, name: playerId, email: `${playerId}@email.com` },
        messages,
      )
    }

    try {
      await service.startAuction(auctionId)

      // Player 1 starts a sale
      players.player1.emit('sell', sale([{ item: 'triangle', quantity: 1 }]))
      await waitToReceiveMessage()
      players.player2.emit('bid', bid(50, 1))

      await waitToEndRound(auctionId)

      // Player 2 disconnects during their turn
      players.player2.close()
      await waitToReceiveMessage()

      // Player 2 reconnects and starts a sale
      players.player2 = io(`http://localhost:${port}`, { path: '/auction', auth: { token: 'player2' } })
      await connectPlayer(
        players.player2,
        { id: 'player2', name: 'player2', email: 'player2@email.com' },
        messages,
      )

      players.player2.emit('sell', sale([{ item: 'triangle', quantity: 1 }]))
      await waitToReceiveMessage()
      players.player3.emit('bid', bid(50, 2))

      await waitToEndRound(auctionId)
      players.player3.emit('sell', sale([{ item: 'triangle', quantity: 1 }]))
      await waitToEndRound(auctionId)

      // Validate auction behavior
      expect(messages.player2.pop().leaderboard).toEqual({
        leaderboard: [
          { id: 'player1', money: 150, inventory: { items: [{ item: 'triangle', quantity: 1 }] }, position: 1 },
          { id: 'player2', money: 100, inventory: { items: [{ item: 'triangle', quantity: 2 }] }, position: 2 },
        ],
        removed: [
          { id: 'player3', money: 100, inventory: { items: [{ item: 'triangle', quantity: 3 }] } },
        ],
      })
    } finally {
      await cleanupPlayers(players)
    }
  })

  it('should handle player disconnecting before their turn', async () => {
    const auctionId = 'auction-disconnect-before-turn'
    const playerIds = ['player1', 'player2', 'player3']

    // Create a custom config with triangle items
    const customConfig = {
      ...defaultConfig,
      id: auctionId,
      startInventory: { items: [{ item: 'triangle', quantity: 2 }] },
    } as AuctionConfig

    // Create the auction
    await service.createAuction(customConfig)

    // Join players
    for (const playerId of playerIds) {
      await service.playerJoin(playerId, auctionId)
    }

    // Create socket connections
    const players: Record<string, Socket> = {}
    const messages: Record<string, any[]> = {}

    for (const playerId of playerIds) {
      players[playerId] = io(`http://localhost:${port}`, {
        path: '/auction',
        auth: { token: playerId },
      })
      messages[playerId] = []

      await connectPlayer(
        players[playerId],
        { id: playerId, name: playerId, email: `${playerId}@email.com` },
        messages,
      )
    }

    try {
      await service.startAuction(auctionId)

      // Player 1 starts a sale
      players.player1.emit('sell', sale([{ item: 'triangle', quantity: 1 }]))
      await waitToReceiveMessage()
      players.player2.emit('bid', bid(50, 1))

      // Player 2 disconnects before their turn
      players.player2.close()
      await waitToReceiveMessage()

      await waitToEndRound(auctionId)

      // Player 2 reconnects
      players.player2 = io(`http://localhost:${port}`, { path: '/auction', auth: { token: 'player2' } })
      await connectPlayer(
        players.player2,
        { id: 'player2', name: 'player2', email: 'player2@email.com' },
        messages,
      )

      // Player 2 cannot start a new sale now because he should be skipped
      players.player2.emit('sell', sale([{ item: 'triangle', quantity: 1 }]))
      await waitToReceiveMessage()

      // Player 3 can sell
      players.player3.emit('sell', sale([{ item: 'triangle', quantity: 1 }]))
      await waitToReceiveMessage()

      // Player 1 bid
      players.player1.emit('bid', bid(30, 2))
      await waitToReceiveMessage()
      // Player 2 can also bid
      players.player2.emit('bid', bid(50, 2))

      // End round
      await waitToEndRound(auctionId)

      expect(messages.player2.pop().playerInfo).toEqual({
        money: 0,
        inventory: { items: [{ item: 'triangle', quantity: 4 }] },
      })

      expect((await service.getAuction(auctionId)).currentRound === 3)

      // Now player 1 can sell
      players.player1.emit('sell', sale([{ item: 'triangle', quantity: 1 }]))
      await waitToReceiveMessage()
      // Player 3 can bid
      players.player3.emit('bid', bid(50, 3))
      await waitToEndRound(auctionId)

      expect(messages.player2.pop().leaderboard).toEqual({
        leaderboard: [
          { id: 'player3', money: 100, inventory: { items: [{ item: 'triangle', quantity: 2 }] }, position: 1 },
        ],
        removed: [
          { id: 'player2', money: 50, inventory: { items: [{ item: 'triangle', quantity: 4 }] } },
          { id: 'player1', money: 200, inventory: { items: [{ item: 'triangle', quantity: 0 }] } },
        ],
      })
    } finally {
      await cleanupPlayers(players)
    }
  })
})
