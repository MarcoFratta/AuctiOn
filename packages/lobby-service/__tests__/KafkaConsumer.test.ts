import { KafkaContainer, StartedKafkaContainer } from '@testcontainers/kafka'
import { Kafka, Producer } from 'kafkajs'
import { KafkaConsumer } from '../src/controllers/KafkaConsumer'
import { LobbyService } from '../src/services/LobbyService'
import { mock } from 'jest-mock-extended'
import { Lobby } from '../src/schemas/Lobby'

jest.setTimeout(90000)
describe('KafkaConsumer', () => {
  let kafka: StartedKafkaContainer
  let kafkaConsumer: KafkaConsumer
  let mockLobbyService: jest.Mocked<LobbyService>
  let producer: Producer

  const defaultLobby: Lobby = {
    id: '123456789012345678901234',
    creator: 'player1',
    players: [
      { userId: 'player1', status: 'waiting' },
    ],
    maxPlayers: 4,
    rounds: 3,
    startAmount: 100,
    startInventory: {
      items: [
        { item: 'square', quantity: 2 },
      ],
    },
    bidTime: 30,
    status: 'waiting',
  }

  beforeAll(async () => {
    // Start Kafka container
    kafka = await new KafkaContainer().withExposedPorts(9093).start()
    // Create Kafka client
    const kafkaClient = new Kafka({
      brokers: [`localhost:${kafka.getMappedPort(9093)}`],
      clientId: 'test-client',
      logLevel: 0,
    })

    // Set up producer for sending test messages
    producer = kafkaClient.producer()
    await producer.connect()

    // Create admin client to set up topics
    const admin = kafkaClient.admin()
    await admin.connect()
    await admin.createTopics({
      topics: [{ topic: 'auction-events', numPartitions: 1 }],
      waitForLeaders: true,
    })
    await admin.disconnect()

    // Initialize mock lobby service
    mockLobbyService = mock<LobbyService>({
      terminateMatch: jest.fn().mockResolvedValue(undefined),
    })

    // Create KafkaConsumer instance
    kafkaConsumer = new KafkaConsumer(kafkaClient, mockLobbyService, 'test-group')
    await kafkaConsumer.connect()
  }, 120000)

  afterAll(async () => {
    await producer.disconnect()
    await kafkaConsumer.disconnect()
    await kafka.stop()
  }, 120000)

  beforeEach(() => {
    jest.clearAllMocks()
  })

  const sendMessage = async (message: any): Promise<void> => {
    await producer.send({
      topic: 'auction-events',
      messages: [{ value: JSON.stringify(message) }],
    })
    // Give some time for the consumer to process the message
    await new Promise(resolve => setTimeout(resolve, 1000))
  }

  describe('Event Consumption', () => {
    it('should handle end-auction event', async () => {
      const event = {
        type: 'end-auction',
        auctionId: defaultLobby.id,
        timestamp: new Date().toISOString(),
        leaderboard: {
          leaderboard: [],
          removed: [],
        },
      }

      await sendMessage(event)

      expect(mockLobbyService.terminateMatch).toHaveBeenCalledWith(defaultLobby.id)
    })

    it('should ignore unknown event types', async () => {
      const event = {
        type: 'unknown-event',
        auctionId: defaultLobby.id,
        timestamp: new Date().toISOString(),
      }

      await sendMessage(event)

      expect(mockLobbyService.terminateMatch).not.toHaveBeenCalled()
    })

    it('should handle malformed messages gracefully', async () => {
      await producer.send({
        topic: 'auction-events',
        messages: [{ value: 'invalid json' }],
      })

      await new Promise(resolve => setTimeout(resolve, 1000))
      expect(mockLobbyService.terminateMatch).not.toHaveBeenCalled()
    })

    it('should handle messages with missing required fields', async () => {
      const invalidEvent = {
        type: 'end-auction',
        // missing auctionId
        timestamp: new Date().toISOString(),
      }

      await sendMessage(invalidEvent)

      expect(mockLobbyService.terminateMatch).not.toHaveBeenCalled()
    })
  })

  describe('Connection Management', () => {
    it('should handle disconnection gracefully', async () => {
      await expect(kafkaConsumer.disconnect()).resolves.not.toThrow()
    })
  })
}) 