import { KafkaConsumer } from '../src/controllers/KafkaConsumer'
import { AuctionService } from '../src/services/AuctionService'
import { KafkaContainer, StartedKafkaContainer } from '@testcontainers/kafka'
import { Kafka } from 'kafkajs'
import { mock, MockProxy } from 'jest-mock-extended'
import { AuctionConfig } from '../src/schemas/Auction'
import { AuctionServiceImpl } from '../src/services/AuctionServiceImpl'
import { LobbyCreatedEvent, LobbyJoinedEvent, LobbyLeftEvent } from '../src/schemas/LobbyEvents'

jest.setTimeout(30 * 1000)
describe('KafkaConsumer', () => {
  let kafkaConsumer: KafkaConsumer
  let mockAuctionService: MockProxy<AuctionService>
  let kafka: StartedKafkaContainer
  let producer: any

  const defaultConfig: AuctionConfig = {
    id: 'lobby1',
    maxPlayers: 4,
    maxRound: 3,
    startAmount: 100,
    startInventory: { items: [{ item: 'square', quantity: 2 }] },
    bidTime: 30,
  }

  beforeAll(async () => {
    kafka = await new KafkaContainer()
      .withExposedPorts(9093)
      .start()

    // Create Kafka admin client to set up topics
    const adminClient = new Kafka({
      brokers: [`localhost:${kafka.getMappedPort(9093)}`],
      clientId: 'admin-client',
    }).admin()

    await adminClient.connect()
    await adminClient.createTopics({
      topics: [{ topic: 'lobby-events', numPartitions: 1 }],
      waitForLeaders: true,
    })
    await adminClient.disconnect()

    // Create producer for sending test messages
    const kafkaClient = new Kafka({
      brokers: [`localhost:${kafka.getMappedPort(9093)}`],
      clientId: 'test-producer',
    })
    producer = kafkaClient.producer()
    await producer.connect()
  }, 60000)

  afterAll(async () => {
    await producer.disconnect()
    await kafka.stop()
  })

  beforeEach(async () => {
    mockAuctionService = mock<AuctionServiceImpl>()

    const kafkaClient = new Kafka({
      brokers: [`localhost:${kafka.getMappedPort(9093)}`],
      clientId: 'test-consumer',
    })

    kafkaConsumer = new KafkaConsumer(kafkaClient, mockAuctionService, 'test-group')
    await kafkaConsumer.connect()
  })

  afterEach(async () => {
    await kafkaConsumer.disconnect()
  })

  const sendMessage = async (message: any) => {
    await producer.send({
      topic: 'lobby-events',
      messages: [{ value: JSON.stringify(message) }],
    })
    // Give some time for the consumer to process the message
    await new Promise(resolve => setTimeout(resolve, 1000))
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
      expect(mockAuctionService.playerJoin).toHaveBeenCalledWith('player1', 'lobby1')
    })

    it('should handle lobby-joined event', async () => {
      const event: LobbyJoinedEvent = {
        type: 'lobby-joined',
        lobbyId: 'lobby1',
        playerId: 'player2',
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
      await producer.send({
        topic: 'lobby-events',
        messages: [{ value: 'invalid json' }],
      })

      await new Promise(resolve => setTimeout(resolve, 1000))

      expect(mockAuctionService.createAuction).not.toHaveBeenCalled()
      expect(mockAuctionService.playerJoin).not.toHaveBeenCalled()
      expect(mockAuctionService.playerLeave).not.toHaveBeenCalled()
    })
  })

  describe('Connection Management', () => {
    it('should connect to Kafka and consume messages', async () => {
      const event: LobbyCreatedEvent = {
        type: 'lobby-created',
        lobby: defaultConfig,
        creator: 'player1',
      }

      await sendMessage(event)

      expect(mockAuctionService.createAuction).toHaveBeenCalled()
    })
  })
}) 