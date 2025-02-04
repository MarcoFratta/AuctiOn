import WebSocket from 'ws'
import logger from '@auction/common/logger'
import { AuctionService } from '../src/services/AuctionService'
import { App } from '../src/App'
import { KafkaContainer, StartedKafkaContainer } from '@testcontainers/kafka'
import { Kafka } from 'kafkajs'
import { AuctionConfig } from '../src/schemas/Auction'
import redisMock from 'ioredis-mock'
import Redis from 'ioredis'

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
    }).admin()

    for (let i = 0; i < retries; i++) {
      try {
        // Attempt to connect to the Kafka admin client
        await admin.connect()
        console.log('Kafka is ready')

        // Create necessary topics if not already present
        await admin.createTopics({
          topics: [
            { topic: 'auction-events', numPartitions: 1 },
            { topic: 'player-events', numPartitions: 1 },
          ],
          waitForLeaders: true, // Ensure leaders are assigned to partitions
        })
        console.log('Topics created successfully')
        await admin.disconnect()
        return
      } catch (error) {
        // Handle Kafka connection failure or other errors
        console.error('Error while connecting or creating topics:', error)
        console.log(`Kafka not ready, retrying... (${i + 1}/${retries})`)
        await admin.disconnect()
        await new Promise(resolve => setTimeout(resolve, delay)) // Wait before retrying
      }
    }

    // If Kafka is still not ready after retries, throw an error
    throw new Error('Kafka did not become ready in time')
  }

  afterAll(async () => {
    await kafka.stop()
  })

  beforeEach((done) => {
    const kafkaBrokers = [`${kafka.getHost()}:${kafka.getMappedPort(9093)}`]


    app = new App(new Kafka({ brokers: kafkaBrokers }),
      redis)
    service = app.auctionService
    app.start(0).then(() => {
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
  const connectPlayer = (player: WebSocket,
                         id: string, messages: Record<string, any[]>) => {
    return new Promise<void>((resolve, reject) => {
      player.on('open', () => {
        logger.info(`${id} connected`)
        resolve()
      })
      player.on('message', message => {
        const msg = JSON.parse(message.toString())
        if (msg.type && msg.type == 'timer-start') {
          return
        }
        messages[id].push(msg)
      })
      player.on('error', reject)
    })
  }

  const defaultConfig: AuctionConfig = {
    id: 'auction1',
    maxPlayers: 4,
    maxRound: 3,
    startAmount: 100,
    startInventory: { items: [{ item: 'square', quantity: 2 }] },
    bidTime: 60,
  }

  it('should simulate a round with players', async () => {
    await service.createAuction(defaultConfig)
    await service.playerJoin('player1', defaultConfig.id)
    await service.playerJoin('player2', defaultConfig.id)
    await service.playerJoin('player3', defaultConfig.id)
    const player1 = new WebSocket(`ws://localhost:${port}/player1`)
    const player2 = new WebSocket(`ws://localhost:${port}/player2`)
    const player3 = new WebSocket(`ws://localhost:${port}/player3`)
    await service.startAuction(defaultConfig.id)

    const messages: Record<string, any[]> = {
      player1: [],
      player2: [],
      player3: [],
    }
    await Promise.all([
      connectPlayer(player1, 'player1', messages),
      connectPlayer(player2, 'player2', messages),
      connectPlayer(player3, 'player3', messages),
    ])

    // Player 1 starts a sale
    player1.send(JSON.stringify({ type: 'sell', sale: { items: [{ item: 'square', quantity: 1 }] } }))
    await waitToReceiveMessage()
    // Players 2 and 3 place bids
    player2.send(JSON.stringify({ type: 'bid', bid: { amount: 50, round: 1 } }))
    player3.send(JSON.stringify({ type: 'bid', bid: { amount: 100, round: 1 } }))
    await waitToReceiveMessage()
    expect(messages.player3.pop().auction.currentBid).toStrictEqual({
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

    // Validate specific auction updates
    const auctionUpdates = messages.player1.filter(msg => msg.type === 'auction')
    expect(auctionUpdates.length).toBeGreaterThan(0)
    expect(messages.player3[messages.player3.length - 1].auction.playerInfo).toStrictEqual({
      money: 0,
      inventory: { items: [{ item: 'square', quantity: 3 }] },
    })
    expect(messages.player1[messages.player1.length - 1].auction.playerInfo).toStrictEqual({
      money: 200,
      inventory: { items: [{ item: 'square', quantity: 1 }] },
    })
    // Close connections
    player1.close()
    player2.close()
    player3.close()
  })

  async function waitToReceiveMessage() {
    await new Promise(resolve => setTimeout(resolve, 100))
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
    await service.setPlayerState('player1', 'connected')
    await service.setPlayerState('player2', 'connected')
    await service.setPlayerState('player3', 'connected')
    await service.startAuction(defaultConfig.id)

    const player1 = new WebSocket(`ws://localhost:${port}/player1`)
    const player2 = new WebSocket(`ws://localhost:${port}/player2`)
    const player3 = new WebSocket(`ws://localhost:${port}/player3`)

    const messages: Record<string, any[]> = { player1: [], player2: [], player3: [] }
    await Promise.all([
      connectPlayer(player1, 'player1', messages),
      connectPlayer(player2, 'player2', messages),
      connectPlayer(player3, 'player3', messages),
    ])

    // Player 1 starts a sale
    player1.send(JSON.stringify({ type: 'sell', sale: { items: [{ item: 'square', quantity: 1 }] } }))
    await waitToReceiveMessage()
    // Players 2 and 3 place bids
    player2.send(JSON.stringify({ type: 'bid', bid: { amount: 50, round: 1 } }))
    player3.send(JSON.stringify({ type: 'bid', bid: { amount: 55, round: 1 } }))
    await waitToEndRound(defaultConfig.id)
    await waitToReceiveMessage()
    //expect(messages.player1.length).toBe(4)
    expect(messages.player3.pop().auction.playerInfo).toStrictEqual({
      money: 45,
      inventory: { items: [{ item: 'square', quantity: 3 }] },
    })
    expect(messages.player2.pop().auction.playerInfo).toStrictEqual({
      money: 100,
      inventory: { items: [{ item: 'square', quantity: 2 }] },
    })
    expect(messages.player1.pop().auction.playerInfo).toStrictEqual({
      money: 155,
      inventory: { items: [{ item: 'square', quantity: 1 }] },
    })
    // Player 2 starts a sale
    player2.send(JSON.stringify({ type: 'sell', sale: { items: [{ item: 'square', quantity: 1 }] } }))
    // no bids
    await waitToEndRound(defaultConfig.id)
    expect(messages.player3.pop().auction.playerInfo).toStrictEqual({
      money: 45,
      inventory: { items: [{ item: 'square', quantity: 3 }] },
    })
    expect(messages.player2.pop().auction.playerInfo).toStrictEqual({
      money: 100,
      inventory: { items: [{ item: 'square', quantity: 2 }] },
    })
    expect(messages.player1.pop().auction.playerInfo).toStrictEqual({
      money: 155,
      inventory: { items: [{ item: 'square', quantity: 1 }] },
    })

    // Player 3 starts a sale
    player3.send(JSON.stringify({ type: 'sell', sale: { items: [{ item: 'square', quantity: 1 }] } }))
    await waitToReceiveMessage()
    // Player 2 sends an old bid that should be ignored
    player2.send(JSON.stringify({ type: 'bid', bid: { amount: 50, round: 2 } }))
    //expect(messages.player2.length).toBe(6);
    // Player 1 places a bid
    player1.send(JSON.stringify({ type: 'bid', bid: { amount: 60, round: 3 } }))
    player2.send(JSON.stringify({ type: 'bid', bid: { amount: 70, round: 3 } }))
    await waitToEndRound(defaultConfig.id)
    expect(messages.player2.pop().auction.playerInfo.money).toBe(30)
    expect(messages.player3.pop().auction.playerInfo.money).toBe(115)

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
    await service.setPlayerState('player1', 'connected')
    await service.setPlayerState('player2', 'connected')
    await service.setPlayerState('player3', 'connected')
    await service.startAuction(config.id)

    const player1 = new WebSocket(`ws://localhost:${port}/player1`)
    const player2 = new WebSocket(`ws://localhost:${port}/player2`)
    const player3 = new WebSocket(`ws://localhost:${port}/player3`)

    const messages: Record<string, any[]> = { player1: [], player2: [], player3: [] }
    await Promise.all([
      connectPlayer(player1, 'player1', messages),
      connectPlayer(player2, 'player2', messages),
      connectPlayer(player3, 'player3', messages),
    ])

    // Player 1 starts a sale
    player1.send(JSON.stringify({ type: 'sell', sale: { items: [{ item: 'triangle', quantity: 1 }] } }))
    player2.send(JSON.stringify({ type: 'bid', bid: { amount: 50, round: 1 } }))

    await waitToEndRound(config.id)
    // Player 2 disconnects during their turn
    player2.close()
    await waitToReceiveMessage()
    // Player 2 reconnects and starts a sale
    const player2Reconnect = new WebSocket(`ws://localhost:${port}/player2`)
    await connectPlayer(player2Reconnect, 'player2', messages)

    player2Reconnect.send(JSON.stringify({ type: 'sell', sale: { items: [{ item: 'triangle', quantity: 1 }] } }))
    player3.send(JSON.stringify({ type: 'bid', bid: { amount: 50, round: 2 } }))

    await waitToEndRound(config.id)
    // Validate auction behavior
    expect(messages.player3.pop().auction.playerInfo.money).toBe(50) // Player3 spent 50
    expect(messages.player2.pop().auction.playerInfo.money).toBe(100) // Player2 received the bid
    expect(messages.player1.pop().auction.playerInfo.money).toBe(150) // Player1 sold the item

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
    await service.startAuction(config.id)

    const player1 = new WebSocket(`ws://localhost:${port}/player1`)
    const player2 = new WebSocket(`ws://localhost:${port}/player2`)
    const player3 = new WebSocket(`ws://localhost:${port}/player3`)

    const messages: Record<string, any[]> = { player1: [], player2: [], player3: [] }
    await Promise.all([
      connectPlayer(player1, 'player1', messages),
      connectPlayer(player2, 'player2', messages),
      connectPlayer(player3, 'player3', messages),
    ])

    // Player 1 starts a sale
    player1.send(JSON.stringify({ type: 'sell', sale: { items: [{ item: 'triangle', quantity: 1 }] } }))
    player2.send(JSON.stringify({ type: 'bid', bid: { amount: 50, round: 1 } }))
    // Player 2 disconnects before their turn
    player2.close()
    await waitToReceiveMessage()

    await waitToEndRound(config.id)
    // Player 2 reconnects and starts a sale
    const player2Reconnect = new WebSocket(`ws://localhost:${port}/player2`)
    await connectPlayer(player2Reconnect, 'player2', messages)
    // Player 2 cannot start a new sale now because he should be skipped
    player2Reconnect.send(JSON.stringify({ type: 'sell', sale: { items: [{ item: 'triangle', quantity: 1 }] } }))
    // Player 3 can start a sale
    await waitToReceiveMessage()

    // Player 3 can sell
    player3.send(JSON.stringify({ type: 'sell', sale: { items: [{ item: 'triangle', quantity: 1 }] } }))
    await waitToReceiveMessage()
    expect(messages.player2.pop().auction.playerInfo).toStrictEqual({
      money: 50,
      inventory: { items: [{ item: 'triangle', quantity: 3 }] },
    })
    // Player 1 bid
    player1.send(JSON.stringify({ type: 'bid', bid: { amount: 30, round: 2 } }))
    // Player 2 can also bid
    player2Reconnect.send(JSON.stringify({ type: 'bid', bid: { amount: 50, round: 2 } }))
    // End round
    await waitToEndRound(config.id)

    expect(messages.player2.pop().auction.playerInfo).toStrictEqual({
      money: 0,
      inventory: { items: [{ item: 'triangle', quantity: 4 }] },
    })

    // Now player 1 can sell
    player1.send(JSON.stringify({ type: 'sell', sale: { items: [{ item: 'triangle', quantity: 1 }] } }))
    // Player 3 can bid
    player3.send(JSON.stringify({ type: 'bid', bid: { amount: 50, round: 3 } }))
    await waitToEndRound(config.id)

    expect(messages.player3.pop().auction.playerInfo.money).toBe(100) // Player3 spent 50
    expect(messages.player2.pop().auction.playerInfo.money).toBe(0) // Player2 received the bid
    expect(messages.player1.pop().auction.playerInfo.money).toBe(200) // Player1 sold the item

    player1.close()
    player2Reconnect.close()
    player3.close()
  })
})
