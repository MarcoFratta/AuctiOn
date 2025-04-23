import logger from '@auction/common/logger'
import { AuctionService } from '../src/services/AuctionService'
import { App } from '../src/App'
import { KafkaContainer, StartedKafkaContainer } from '@testcontainers/kafka'
import { Kafka } from 'kafkajs'
import { AuctionConfig } from '../src/schemas/Auction'
import redisMock from 'ioredis-mock'
import Redis from 'ioredis'
import { User } from '../src/schemas/User'
import { io } from 'socket.io-client'

jest.setTimeout(120 * 1000)
describe('Auction System Integration Test', () => {
  let service: AuctionService
  let port: number
  let app: App
  let kafka: StartedKafkaContainer
  let redis: Redis

  beforeAll(async () => {
    kafka = await new KafkaContainer().withExposedPorts(9093).start()
    redis = new redisMock()
    await waitForKafkaToBeReady(kafka)
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

  afterAll(async () => {
    await kafka.stop()
    redis.disconnect()
  })

  beforeEach((done) => {
    const kafkaBrokers = [`${kafka.getHost()}:${kafka.getMappedPort(9093)}`]
    app = new App(new Kafka({ brokers: kafkaBrokers, logLevel: 0 }),
      redis)
    service = app.auctionService
    app.start(3000).then(() => {
      const address = app.server.address()
      if (address && typeof address === 'object') {
        port = address.port
      } else {
        throw new Error('Failed to assign a dynamic port')
      }
    }).then(() => {
      done()
    }).catch(done)
  });

  afterEach(async () => {
    await app.stop()
    await redis.flushall()

  })
  const connectPlayer = (
    player: any,
    user: User,
    messages: Record<string, any[]>,
  ) => {
    return new Promise<void>((resolve, reject) => {
      player.on('connect', () => {
        logger.info(`${user.id} connected`)
        resolve()
      })

      player.onAny((type: any, msg: any) => {
        logger.info(`Received message ${type} from ${user.id}:
         ${JSON.stringify(msg)}`)
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

  const defaultConfig: AuctionConfig = {
    id: 'auction1',
    maxPlayers: 4,
    creatorId: 'player1',
    maxRound: 3,
    startAmount: 100,
    startInventory: { items: [{ item: 'square', quantity: 2 }] },
    bidTime: 60,
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

  it('should simulate a round with players', async () => {
    await service.createAuction(defaultConfig)
    await service.playerJoin('player1', defaultConfig.id)
    await service.playerJoin('player2', defaultConfig.id)
    await service.playerJoin('player3', defaultConfig.id)

    const player1 = io(`http://localhost:${port}`, { path: '/auction', auth: { token: 'player1' } })
    const player2 = io(`http://localhost:${port}`, { path: '/auction', auth: { token: 'player2' } })
    const player3 = io(`http://localhost:${port}`, { path: '/auction', auth: { token: 'player3' } })


    const messages: Record<string, any[]> = {
      player1: [],
      player2: [],
      player3: [],
    }
    await Promise.all([
      connectPlayer(player1, { id: 'player1', name: 'player1', email: 'e@email.com' }, messages),
      connectPlayer(player2, { id: 'player2', name: 'player2', email: 'e@email.com' }, messages),
      connectPlayer(player3, { id: 'player3', name: 'player3', email: 'e@email.com' }, messages),
    ])
    await service.startAuction(defaultConfig.id)

    logger.info(`starting auction`)

    // Player 1 starts a sale
    player1.emit('sell', sale([{ item: 'square', quantity: 1 }]))
    await waitToReceiveMessage()
    // Players 2 and 3 place bids
    player2.emit('bid', bid(50, 1))
    player3.emit('bid', bid(100, 1))
    await waitToReceiveMessage()
    expect(messages.player3.pop().bid).toEqual({
      amount: 100,
      round: 1,
      playerId: 'player3',
      timestamp: expect.any(String),
    })
    await service.endRound(defaultConfig.id)
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
    // Close connections
    player1.close()
    player2.close()
    player3.close()
  })

  async function waitToReceiveMessage() {
    await new Promise(resolve => setTimeout(resolve, 150))
  }

  async function waitToEndRound(auctionId: string) {
    await waitToReceiveMessage()
    await service.endRound(auctionId)
    await waitToReceiveMessage()
  }

  it('should simulate a full match with players', async () => {
    await service.createAuction(defaultConfig)
    await service.playerJoin('player1', defaultConfig.id)
    await service.playerJoin('player2', defaultConfig.id)
    await service.playerJoin('player3', defaultConfig.id)


    const player1 = io(`http://localhost:${port}`, { path: '/auction', auth: { token: 'player1' } })
    const player2 = io(`http://localhost:${port}`, { path: '/auction', auth: { token: 'player2' } })
    const player3 = io(`http://localhost:${port}`, { path: '/auction', auth: { token: 'player3' } })

    const messages: Record<string, any[]> = { player1: [], player2: [], player3: [] }
    await Promise.all([
      connectPlayer(player1, { id: 'player1', name: 'player1', email: 'e@email.com' }, messages),
      connectPlayer(player2, { id: 'player2', name: 'player2', email: 'e@email.com' }, messages),
      connectPlayer(player3, { id: 'player3', name: 'player3', email: 'e@email.com' }, messages),
    ])
    await service.startAuction(defaultConfig.id)

    // Player 1 starts a sale
    player1.emit('sell', sale([{ item: 'square', quantity: 1 }]))
    await waitToReceiveMessage()
    // Players 2 and 3 place bids
    player2.emit('bid', bid(50, 1))
    player3.emit('bid', bid(55, 1))
    await waitToEndRound(defaultConfig.id)
    await waitToReceiveMessage()
    //expect(messages.player1.length).toBe(4)
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
    player2.emit('sell', sale([{ item: 'square', quantity: 1 }]))
    // no bids
    await waitToEndRound(defaultConfig.id)
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
    player3.emit('sell', sale([{ item: 'square', quantity: 1 }]))
    await waitToReceiveMessage()
    // Player 2 emits an old bid that should be ignored
    player2.emit('bid', bid(50, 2))
    //expect(messages.player2.length).toBe(6);
    // Player 1 places a bid
    player1.emit('bid', bid(60, 3))
    player2.emit('bid', bid(70, 3))
    await waitToEndRound(defaultConfig.id)
    expect(messages.player2.pop().leaderboard).toEqual({
      leaderboard: [
        { id: 'player1', money: 155, inventory: { items: [{ item: 'square', quantity: 1 }] }, position: 1 },
        { id: 'player3', money: 115, inventory: { items: [{ item: 'square', quantity: 2 }] }, position: 2 },
      ],
      removed: [
        { id: 'player2', money: 30, inventory: { items: [{ item: 'square', quantity: 3 }] } },
      ],
    })

    // Close connections
    player1.close()
    player2.close()
    player3.close()
  })

  it('should handle player disconnecting and reconnecting during their turn', async () => {
    const config: AuctionConfig = {
      ...defaultConfig,
      startInventory: { items: [{ item: 'triangle', quantity: 2 }] },
    }

    await service.createAuction(config)
    await service.playerJoin('player1', config.id)
    await service.playerJoin('player2', config.id)
    await service.playerJoin('player3', config.id)


    const player1 = io(`http://localhost:${port}`, { path: '/auction', auth: { token: 'player1' } })
    const player2 = io(`http://localhost:${port}`, { path: '/auction', auth: { token: 'player2' } })
    const player3 = io(`http://localhost:${port}`, { path: '/auction', auth: { token: 'player3' } })

    const messages: Record<string, any[]> = { player1: [], player2: [], player3: [] }
    await Promise.all([
      connectPlayer(player1, { id: 'player1', name: 'player1', email: 'e@email.com' }, messages),
      connectPlayer(player2, { id: 'player2', name: 'player2', email: 'e@email.com' }, messages),
      connectPlayer(player3, { id: 'player3', name: 'player3', email: 'e@email.com' }, messages),
    ])

    await service.startAuction(config.id)

    // Player 1 starts a sale
    player1.emit('sell', sale([{ item: 'triangle', quantity: 1 }]))
    player2.emit('bid', bid(50, 1))

    await waitToEndRound(config.id)
    // Player 2 disconnects during their turn
    player2.close()
    await waitToReceiveMessage()
    // Player 2 reconnects and starts a sale
    const player2Reconnect = io(`http://localhost:${port}`, { path: '/auction', auth: { token: 'player2' } })
    await connectPlayer(player2Reconnect, { id: 'player2', name: 'player2', email: 'e@email.com' }, messages)

    player2Reconnect.emit('sell', sale([{ item: 'triangle', quantity: 1 }]))
    player3.emit('sell', bid(50, 2))

    await waitToEndRound(config.id)
    player3.emit('sell', sale([{ item: 'triangle', quantity: 1 }]))
    await waitToEndRound(config.id)
    // Validate auction behavior
    expect(messages.player2.pop().leaderboard).toEqual({
      leaderboard: [
        { id: 'player1', money: 150, inventory: { items: [{ item: 'triangle', quantity: 1 }] }, position: 1 },
        { id: 'player2', money: 100, inventory: { items: [{ item: 'triangle', quantity: 2 }] }, position: 2 },
      ],
      removed: [
        { id: 'player3', money: 50, inventory: { items: [{ item: 'triangle', quantity: 3 }] } },
      ],
    })

    player1.close()
    player2Reconnect.close()
    player3.close()
  })
  it('should handle player disconnecting before their turn', async () => {
    const config: AuctionConfig = {
      ...defaultConfig,
      startInventory: { items: [{ item: 'triangle', quantity: 2 }] },
    }

    await service.createAuction(config)
    await service.playerJoin('player1', config.id)
    await service.playerJoin('player2', config.id)
    await service.playerJoin('player3', config.id)


    const player1 = io(`http://localhost:${port}`, { path: '/auction', auth: { token: 'player1' } })
    const player2 = io(`http://localhost:${port}`, { path: '/auction', auth: { token: 'player2' } })
    const player3 = io(`http://localhost:${port}`, { path: '/auction', auth: { token: 'player3' } })

    const messages: Record<string, any[]> = { player1: [], player2: [], player3: [] }
    await Promise.all([
      connectPlayer(player1, { id: 'player1', name: 'player1', email: 'e@email.com' }, messages),
      connectPlayer(player2, { id: 'player2', name: 'player2', email: 'e@email.com' }, messages),
      connectPlayer(player3, { id: 'player3', name: 'player3', email: 'e@email.com' }, messages),
    ])

    await service.startAuction(config.id)

    // Player 1 starts a sale
    player1.emit('sell', sale([{ item: 'triangle', quantity: 1 }]))
    player2.emit('bid', bid(50, 1))
    // Player 2 disconnects before their turn
    player2.close()
    await waitToReceiveMessage()

    await waitToEndRound(config.id)
    // Player 2 reconnects and starts a sale
    const player2Reconnect = io(`http://localhost:${port}`, { path: '/auction', auth: { token: 'player2' } })
    await connectPlayer(player2Reconnect, { id: 'player2', name: 'player2', email: 'e@email.com' }, messages)
    // Player 2 cannot start a new sale now because he should be skipped
    player2Reconnect.emit('sell', sale([{ item: 'triangle', quantity: 1 }]))
    // Player 3 can start a sale
    await waitToReceiveMessage()

    // Player 3 can sell
    player3.emit('sell', sale([{ item: 'triangle', quantity: 1 }]))
    await waitToReceiveMessage()

    // Player 1 bid
    player1.emit('bid', bid(30, 2))
    // Player 2 can also bid
    player2Reconnect.emit('bid', bid(50, 2))
    // End round
    await waitToEndRound(config.id)

    expect(messages.player2.pop().playerInfo).toEqual({
      money: 0,
      inventory: { items: [{ item: 'triangle', quantity: 4 }] },
    })

    // Now player 1 can sell
    player1.emit('sell', sale([{ item: 'triangle', quantity: 1 }]))
    // Player 3 can bid
    player3.emit('bid', bid(50, 3))
    await waitToEndRound(config.id)

    expect(messages.player2.pop().leaderboard).toEqual({
      leaderboard: [
        { id: 'player3', money: 100, inventory: { items: [{ item: 'triangle', quantity: 2 }] }, position: 1 },
      ],
      removed: [
        { id: 'player2', money: 0, inventory: { items: [{ item: 'triangle', quantity: 4 }] } },
        { id: 'player1', money: 200, inventory: { items: [{ item: 'triangle', quantity: 0 }] } },
      ],
    })

    player1.close()
    player2Reconnect.close()
    player3.close()
  })
})
