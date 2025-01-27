import { KafkaContainer, StartedKafkaContainer } from '@testcontainers/kafka'
import { Consumer, Kafka } from 'kafkajs'
import { KafkaProducer } from '../src/controllers/KafkaProducer'
import { LobbyService } from '../src/services/LobbyService'
import { mock } from 'jest-mock-extended'
import { Lobby } from '../src/schemas/Lobby'

describe('KafkaProducer', () => {
  let kafka: StartedKafkaContainer
  let kafkaProducer: KafkaProducer
  let mockLobbyService: jest.Mocked<LobbyService>
  let consumer: Consumer
  let receivedMessages: any[] = []
  let callbacks: Map<string, Function[]>

  const defaultLobby: Lobby = {
    id: 'lobby1',
    creator: 'player1',
    players: [{ userId: 'player1', status: 'ready' }],
    maxPlayers: 4,
    status: 'waiting',
    rounds: 3,
    startAmount: 100,
    startInventory: { items: [{ item: 'square', quantity: 2 }] },
    bidTime: 30,
  }

  beforeAll(async () => {
    // Start Kafka container
    kafka = await new KafkaContainer().withExposedPorts(9093).start()

    // Create Kafka client
    const kafkaClient = new Kafka({
      brokers: [`localhost:${kafka.getMappedPort(9093)}`],
      clientId: 'test-client',
    })

    // Set up consumer to verify produced messages
    consumer = kafkaClient.consumer({ groupId: 'test-group' })
    await consumer.connect()
    await consumer.subscribe({ topic: 'lobby-events', fromBeginning: true })

    // Create admin client to set up topics
    const admin = kafkaClient.admin()
    await admin.connect()
    await admin.createTopics({
      topics: [{ topic: 'lobby-events', numPartitions: 1 }],
      waitForLeaders: true,
    })
    await admin.disconnect()

    // Set up message collection
    await consumer.run({
      eachMessage: async ({ message }) => {
        receivedMessages.push(JSON.parse(message.value!.toString()))
      },
    })

    // Initialize mock lobby service
    callbacks = new Map()
    mockLobbyService = mock<LobbyService>({
      onLobbyJoined: jest.fn((callback) => {
        if (!callbacks.has('onLobbyJoined')) callbacks.set('onLobbyJoined', [])
        callbacks.get('onLobbyJoined')!.push(callback)
      }),
      onLobbyLeft: jest.fn((callback) => {
        if (!callbacks.has('onLobbyLeft')) callbacks.set('onLobbyLeft', [])
        callbacks.get('onLobbyLeft')!.push(callback)
      }),
      onLobbyCreated: jest.fn((callback) => {
        if (!callbacks.has('onLobbyCreated')) callbacks.set('onLobbyCreated', [])
        callbacks.get('onLobbyCreated')!.push(callback)
      }),
      onLobbyDeleted: jest.fn((callback) => {
        if (!callbacks.has('onLobbyDeleted')) callbacks.set('onLobbyDeleted', [])
        callbacks.get('onLobbyDeleted')!.push(callback)
      }),
      onLobbyStarted: jest.fn((callback) => {
        if (!callbacks.has('onLobbyStarted')) callbacks.set('onLobbyStarted', [])
        callbacks.get('onLobbyStarted')!.push(callback)
      }),
    })

    // Create KafkaProducer instance
    kafkaProducer = new KafkaProducer(kafkaClient, mockLobbyService)
    await kafkaProducer.connect()
  }, 60000)

  afterAll(async () => {
    await consumer.disconnect()
    await kafkaProducer.disconnect()
    await kafka.stop()
  })

  beforeEach(() => {
    receivedMessages = []
  })

  const waitForMessages = async (count: number = 1, timeout: number = 6000) => {
    const startTime = Date.now()
    while (receivedMessages.length < count && Date.now() - startTime < timeout) {
      await new Promise(resolve => setTimeout(resolve, 100))
    }
    if (receivedMessages.length < count) {
      throw new Error('Timeout waiting for messages')
    }
  }

  describe('Event Production', () => {
    it('should produce lobby-created event', async () => {
      callbacks.get('onLobbyCreated')![0](defaultLobby)

      await waitForMessages()

      expect(receivedMessages[0]).toMatchObject({
        type: 'lobby-created',
        creator: defaultLobby.creator,
        lobby: {
          maxPlayers: defaultLobby.maxPlayers,
          maxRound: defaultLobby.rounds,
          startAmount: defaultLobby.startAmount,
          startInventory: defaultLobby.startInventory,
          bidTime: defaultLobby.bidTime,
        },
      })
    })

    it('should produce lobby-joined event', async () => {
      const playerId = 'player2'
      callbacks.get('onLobbyJoined')![0](defaultLobby, playerId)

      await waitForMessages()

      expect(receivedMessages[0]).toMatchObject({
        type: 'lobby-joined',
        lobbyId: defaultLobby.id,
        playerId,
      })
    })

    it('should produce lobby-left event', async () => {
      const playerId = 'player1'
      callbacks.get('onLobbyLeft')![0](defaultLobby, playerId)

      await waitForMessages()

      expect(receivedMessages[0]).toMatchObject({
        type: 'lobby-left',
        lobbyId: defaultLobby.id,
        playerId,
      })
    })

    it('should produce lobby-started event', async () => {
      callbacks.get('onLobbyStarted')![0](defaultLobby)

      await waitForMessages()

      expect(receivedMessages[0]).toMatchObject({
        type: 'lobby-started',
        lobbyId: defaultLobby.id,
      })
    })

    it('should produce lobby-deleted event', async () => {
      callbacks.get('onLobbyDeleted')![0](defaultLobby)

      await waitForMessages()

      expect(receivedMessages[0]).toMatchObject({
        type: 'lobby-deleted',
        lobbyId: defaultLobby.id,
      })
    })

    it('should handle multiple events in sequence', async () => {
      callbacks.get('onLobbyCreated')![0](defaultLobby)
      callbacks.get('onLobbyJoined')![0](defaultLobby, 'player2')
      callbacks.get('onLobbyStarted')![0](defaultLobby)

      await waitForMessages(3)

      expect(receivedMessages).toHaveLength(3)
      expect(new Set(receivedMessages.map(msg => msg.type))).toStrictEqual(new Set([
        'lobby-created',
        'lobby-joined',
        'lobby-started',
      ]))
    })
  })

  describe('Error Handling', () => {
    it('should handle connection errors gracefully', async () => {
      await kafka.stop()

      await expect(kafkaProducer.connect()).rejects.toThrow()

      // Restart container for other tests
      kafka = await new KafkaContainer().withExposedPorts(9093).start()
    })

    it('should handle disconnection gracefully', async () => {
      await expect(kafkaProducer.disconnect()).resolves.not.toThrow()
    })
  })
}) 