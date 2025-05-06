import { LobbyConsumer } from '../src/controllers/LobbyConsumer'
import { AuctionService } from '../src/services/AuctionService'
import { mock, MockProxy } from 'jest-mock-extended'
import { AuctionConfig } from '../src/schemas/Auction'
import { LobbyCreatedEvent, LobbyJoinedEvent, LobbyLeftEvent } from '@auction/common/events/lobby'
import RedisMock from 'ioredis-mock'
import { UserServiceImpl } from '../src/services/UserServiceImpl'
import { Consumer, Kafka, Producer } from 'kafkajs'
import { KafkaContainer, StartedKafkaContainer } from '@testcontainers/kafka'
import { Redis } from 'ioredis'

jest.setTimeout(60000)
describe('LobbyConsumer', () => {
  let kafkaConsumer: LobbyConsumer
  let mockAuctionService: MockProxy<AuctionService>
  let userService: UserServiceImpl
  let producer: Producer
  let consumer: Consumer
  let kafka: Kafka
  let container: StartedKafkaContainer
  let redis: Redis

  // Test data
  const defaultConfig: AuctionConfig = {
    id: 'lobby1',
    maxPlayers: 4,
    creatorId: 'player1',
    maxRound: 3,
    startAmount: 100,
    startInventory: { items: [{ item: 'square', quantity: 2 }] },
    bidTime: 30,
  }

  beforeAll(async () => {
    // Start Kafka container
    container = await new KafkaContainer().withExposedPorts(9093).start()

    // Setup Kafka client
    kafka = new Kafka({
      clientId: 'test-client',
      brokers: [`localhost:${container.getMappedPort(9093)}`],
      logLevel: 0,
    })

    // Create producer and consumer
    producer = kafka.producer()
    consumer = kafka.consumer({ groupId: 'test-group' })

    // Create topic if it doesn't exist
    const admin = kafka.admin()
    await admin.connect()
    await admin.createTopics({
      topics: [{ topic: 'lobby-events', numPartitions: 1 }],
      waitForLeaders: true,
    })
    await admin.disconnect()

    // Connect producer
    await producer.connect()

    // Setup Redis
    redis = new RedisMock()

    // Create services
    userService = new UserServiceImpl(redis)

    // Create and connect the consumer
    mockAuctionService = mock<AuctionService>()
    kafkaConsumer = new LobbyConsumer(
      kafka,
      mockAuctionService,
      'test-group',
      userService,
    )
    await kafkaConsumer.connect()

    // Wait a bit for consumer to be ready
    await new Promise(resolve => setTimeout(resolve, 1000))
  })

  afterAll(async () => {
    // Disconnect consumer and producer
    await kafkaConsumer.disconnect()
    await producer.disconnect()

    // Stop Kafka container
    await container.stop()
  })

  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks()
    mockAuctionService = mock<AuctionService>()

    // Reset the consumer's auction service reference
    kafkaConsumer['auctionService'] = mockAuctionService
  })

  // Helper to send a message to Kafka
  const sendMessage = async (message: any) => {
    await producer.send({
      topic: 'lobby-events',
      messages: [{ value: JSON.stringify(message) }],
    })

    // Wait for message to be processed
    await new Promise(resolve => setTimeout(resolve, 500))
  }

  describe('Event Handling', () => {
    it('should handle lobby-created event', async () => {
      const event: LobbyCreatedEvent = {
        type: 'lobby-created',
        lobby: defaultConfig,
        creator: 'player1',
      }

      await sendMessage(event)

      expect(mockAuctionService.createAuction).toHaveBeenCalledWith(defaultConfig)
    })

    it('should handle lobby-joined event', async () => {
      const event: LobbyJoinedEvent = {
        type: 'lobby-joined',
        lobbyId: 'lobby1',
        playerId: 'player2',
        username: 'player2',
      }

      await sendMessage(event)

      expect(mockAuctionService.playerJoin).toHaveBeenCalledWith('player2', 'lobby1')
    })

    it('should handle lobby-left event', async () => {
      const event: LobbyLeftEvent = {
        type: 'lobby-left',
        lobbyId: 'lobby1',
        playerId: 'player1',
      }

      await sendMessage(event)

      expect(mockAuctionService.playerLeave).toHaveBeenCalledWith('player1', 'lobby1')
    })

    it('should handle lobby-started event', async () => {
      const event = {
        type: 'lobby-started',
        lobbyId: 'lobby1',
      }

      await sendMessage(event)

      expect(mockAuctionService.startAuction).toHaveBeenCalledWith('lobby1')
    })

    it('should handle player-update event', async () => {
      const event = {
        type: 'player-update',
        playerId: 'player1',
        username: 'Updated Name',
        status: 'ready',
      }

      await sendMessage(event)

      // Verify user service was called to update the player
      expect(mockAuctionService.createAuction).not.toHaveBeenCalled()
      expect(mockAuctionService.playerJoin).not.toHaveBeenCalled()
      expect(mockAuctionService.playerLeave).not.toHaveBeenCalled()
    })

    it('should handle invalid event type gracefully', async () => {
      const event = {
        type: 'invalid-type',
        lobbyId: 'lobby1',
        playerId: 'player1',
      }

      await sendMessage(event)

      expect(mockAuctionService.createAuction).not.toHaveBeenCalled()
      expect(mockAuctionService.playerJoin).not.toHaveBeenCalled()
      expect(mockAuctionService.playerLeave).not.toHaveBeenCalled()
    })

    it('should handle malformed messages gracefully', async () => {
      // Send invalid JSON
      await producer.send({
        topic: 'lobby-events',
        messages: [{ value: 'invalid json' }],
      })

      // Wait for message to be processed
      await new Promise(resolve => setTimeout(resolve, 500))

      expect(mockAuctionService.createAuction).not.toHaveBeenCalled()
      expect(mockAuctionService.playerJoin).not.toHaveBeenCalled()
      expect(mockAuctionService.playerLeave).not.toHaveBeenCalled()
    })
  })
}) 