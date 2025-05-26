import { AuctionProducer } from '../src/controllers/AuctionProducer'
import { AuctionService } from '../src/services/AuctionService'
import { PlayerEventSource } from '../src/adapters/PlayerEventSource'
import { Kafka } from 'kafkajs'
import { mock, MockProxy } from 'jest-mock-extended'
import { UserService } from '../src/services/UserService'
import { KafkaContainer, StartedKafkaContainer } from '@testcontainers/kafka'
import { AuctionInfo } from '../src/schemas/Auction'
import { Leaderboard } from '../src/schemas/Leaderboard'
import { PlayerInfo } from '../src/schemas/Player'
import { AuctionEventsSource } from '../src/services/AuctionEventsSource'
import { TimerEventSource } from '../src/services/TimerEventSource'
import { Bid } from '../src/schemas/Bid'
import { Sale } from '../src/schemas/Sale'
import logger from '@auction/common/logger'

jest.setTimeout(60000)
describe('LobbyProducer', () => {
  let auctionService: MockProxy<AuctionService>
  let userService: MockProxy<UserService>
  let eventSource: MockProxy<PlayerEventSource>
  let auctionEventsSource: MockProxy<AuctionEventsSource>
  let timerEventSource: MockProxy<TimerEventSource>
  let kafkaClient: Kafka
  let kafkaProducer: AuctionProducer
  let container: StartedKafkaContainer
  let producerSendSpy: jest.SpyInstance

  const mockAuctionId = 'auction123'
  const mockPlayerId = 'player123'
  const mockPlayerInfo: PlayerInfo = { username: 'Test Player', status: 'ready' }
  const mockAuction = {
    id: mockAuctionId,
    creatorId: mockPlayerId,
    players: [{
      id: mockPlayerId,
      money: 100,
      inventory: new Map([
        ['square', 2],
        ['triangle', 1],
        ['circle', 1],
      ]),
      status: 'connected',
    }],
    round: 1,
    currentRound: 1,
    maxRound: 3,
    startAmount: 100,
    bidTime: 30,
    maxPlayers: 4,
    sellerQueue: [mockPlayerId],
    startInventory: {
      items: [
        { item: 'square', quantity: 2 },
        { item: 'triangle', quantity: 1 },
        { item: 'circle', quantity: 1 },
      ],
    },
  } as AuctionInfo
  const mockLeaderboard = {
    leaderboard: [{
      id: mockPlayerId,
      money: 100,
      inventory: {
        items: [
          { item: 'circle', quantity: 1 },
        ],
      },
      position: 1,
    }],
    removed: [],
  } as Leaderboard
  const mockBid: Bid = {
    playerId: mockPlayerId,
    amount: 50,
    round: 1,
    timestamp: new Date().toISOString(),
  }
  const mockSale: Sale = {
    sellerId: mockPlayerId,
    items: new Map([['square', 2]]),
    endTimestamp: undefined,
  }

  beforeAll(async () => {
    // Start Kafka container once for all tests
    container = await new KafkaContainer().withExposedPorts(9093).start()

    kafkaClient = new Kafka({
      brokers: [`localhost:${container.getMappedPort(9093)}`],
      clientId: 'test-client',
      logLevel: 0,
    })
  })

  afterAll(async () => {
    await container.stop()
  })

  beforeEach(async () => {
    // Create fresh mocks for each test
    auctionService = mock<AuctionService>()
    eventSource = mock<PlayerEventSource>()
    userService = mock<UserService>()
    auctionEventsSource = mock<AuctionEventsSource>()
    timerEventSource = mock<TimerEventSource>()

    // Setup standard mock responses
    auctionService.getPlayerAuction.mockResolvedValue(mockAuction)
    userService.getUser.mockResolvedValue(mockPlayerInfo)

    // Create producer for each test
    kafkaProducer = new AuctionProducer(
      kafkaClient,
      auctionService,
      auctionEventsSource,
      eventSource,
      userService,
      timerEventSource,
    )

    // Mock the producer's send method
    producerSendSpy = jest.spyOn(kafkaProducer['kafkaProducer'], 'send').mockResolvedValue([])

    // Connect the producer
    await kafkaProducer.connect()
  })

  afterEach(async () => {
    // Clean up after each test
    await kafkaProducer['kafkaProducer'].disconnect()
    jest.clearAllMocks()
  })

  // Player connection events
  test('should emit player-connected event when player connects', async () => {
    const callback = eventSource.onPlayerConnect.mock.calls[0][0]
    await callback(mockPlayerId)

    expect(producerSendSpy).toHaveBeenCalledTimes(1)

    const sentMessage = JSON.parse(producerSendSpy.mock.calls[0][0].messages[0].value)
    expect(sentMessage.type).toBe('player-connected')
    expect(sentMessage.auctionId).toBe(mockAuctionId)
    expect(sentMessage.playerId).toBe(mockPlayerId)
  })

  test('should emit player-disconnected event when player disconnects', async () => {
    const callback = eventSource.onPlayerDisconnect.mock.calls[0][0]
    await callback(mockPlayerId)

    expect(producerSendSpy).toHaveBeenCalledTimes(1)

    const sentMessage = JSON.parse(producerSendSpy.mock.calls[0][0].messages[0].value)
    expect(sentMessage.type).toBe('player-disconnected')
    expect(sentMessage.auctionId).toBe(mockAuctionId)
    expect(sentMessage.playerId).toBe(mockPlayerId)
  })

  // Auction lifecycle events
  test('should emit auction-end event when auction ends', async () => {
    const callback = auctionEventsSource.onAuctionEnd.mock.calls[0][0]
    await callback(mockLeaderboard, mockAuctionId)

    expect(producerSendSpy).toHaveBeenCalledTimes(1)

    const sentMessage = JSON.parse(producerSendSpy.mock.calls[0][0].messages[0].value)
    expect(sentMessage.type).toBe('end-auction')
    expect(sentMessage.auctionId).toBe(mockAuctionId)
    expect(sentMessage.leaderboard).toBeDefined()
  })

  test('should emit round-end event when round ends', async () => {
    const callback = auctionEventsSource.onRoundEnd.mock.calls[0][0]
    await callback(mockAuction)

    expect(producerSendSpy).toHaveBeenCalledTimes(1)

    const sentMessage = JSON.parse(producerSendSpy.mock.calls[0][0].messages[0].value)
    expect(sentMessage.type).toBe('end-round')
    expect(sentMessage.auctionId).toBe(mockAuctionId)
  })

  test('should emit auction-start event when auction starts', async () => {
    const callback = auctionEventsSource.onAuctionStart.mock.calls[0][0]
    await callback(mockAuction)

    expect(producerSendSpy).toHaveBeenCalledTimes(1)

    const sentMessage = JSON.parse(producerSendSpy.mock.calls[0][0].messages[0].value)
    expect(sentMessage.type).toBe('lobby-started')
    expect(sentMessage.lobbyId).toBe(mockAuctionId)
  })

  test('should emit auction-deleted event when auction is deleted', async () => {
    const callback = auctionEventsSource.onAuctionDeleted.mock.calls[0][0]
    await callback(mockAuction)

    expect(producerSendSpy).toHaveBeenCalledTimes(1)

    const sentMessage = JSON.parse(producerSendSpy.mock.calls[0][0].messages[0].value)
    expect(sentMessage.type).toBe('lobby-deleted')
    expect(sentMessage.lobbyId).toBe(mockAuctionId)
  })

  // Player actions events
  test('should emit bid event when new bid is placed', async () => {
    const auctionWithBid = {
      ...mockAuction,
      currentBid: mockBid,
    }

    const callback = auctionEventsSource.onNewBid.mock.calls[0][0]
    await callback(auctionWithBid)

    expect(producerSendSpy).toHaveBeenCalledTimes(1)

    const sentMessage = JSON.parse(producerSendSpy.mock.calls[0][0].messages[0].value)
    expect(sentMessage.type).toBe('bid')
    expect(sentMessage.auctionId).toBe(mockAuctionId)
    expect(sentMessage.playerId).toBe(mockPlayerId)
    expect(sentMessage.bid.amount).toBe(mockBid.amount)
  })

  test('should emit sale event when new sale is created', async () => {
    const auctionWithSale = {
      ...mockAuction,
      currentSale: mockSale,
    }

    const callback = auctionEventsSource.onNewSale.mock.calls[0][0]
    await callback(auctionWithSale)

    expect(producerSendSpy).toHaveBeenCalledTimes(1)

    const sentMessage = JSON.parse(producerSendSpy.mock.calls[0][0].messages[0].value)
    logger.debug('Sent message:', JSON.stringify(sentMessage))
    expect(sentMessage.type).toBe('sale')
    expect(sentMessage.sale).toBeDefined()
    expect(sentMessage.auctionId).toBe(mockAuctionId)
    expect(sentMessage.playerId).toBe(mockPlayerId)
    expect(sentMessage.sale.items).toEqual([{ 'item': 'square', 'quantity': 2 }])
  })

  // Player membership events
  test('should emit player-leave event when player leaves', async () => {
    const callback = auctionEventsSource.onPlayerLeave.mock.calls[0][0]
    await callback(mockAuctionId, mockPlayerId)

    expect(producerSendSpy).toHaveBeenCalledTimes(1)

    const sentMessage = JSON.parse(producerSendSpy.mock.calls[0][0].messages[0].value)
    expect(sentMessage.type).toBe('lobby-left')
    expect(sentMessage.lobbyId).toBe(mockAuctionId)
    expect(sentMessage.playerId).toBe(mockPlayerId)
  })

  test('should emit player-join event when player joins', async () => {
    const callback = auctionEventsSource.onPlayerJoin.mock.calls[0][0]
    await callback(mockAuctionId, mockPlayerId)

    expect(producerSendSpy).toHaveBeenCalledTimes(1)

    const sentMessage = JSON.parse(producerSendSpy.mock.calls[0][0].messages[0].value)
    expect(sentMessage.type).toBe('lobby-joined')
    expect(sentMessage.lobbyId).toBe(mockAuctionId)
    expect(sentMessage.playerId).toBe(mockPlayerId)
    expect(sentMessage.username).toBe(mockPlayerInfo.username)
  })

  // Player info events
  test('should emit player-info event when player info changes', async () => {
    const callback = userService.onPlayerChange.mock.calls[0][0]
    await callback(mockPlayerId, mockPlayerInfo)

    expect(producerSendSpy).toHaveBeenCalledTimes(1)

    const sentMessage = JSON.parse(producerSendSpy.mock.calls[0][0].messages[0].value)
    expect(sentMessage.type).toBe('player-update')
    expect(sentMessage.playerId).toBe(mockPlayerId)
    expect(sentMessage.username).toBe(mockPlayerInfo.username)
    expect(sentMessage.status).toBe(mockPlayerInfo.status)
  })

  // Timer events
  test('should emit timer-start event when timer starts', async () => {
    const startTime = Date.now()
    const callback = timerEventSource.onTimerStart.mock.calls[0][0]
    await callback(mockAuctionId, startTime)

    expect(producerSendSpy).toHaveBeenCalledTimes(1)

    const sentMessage = JSON.parse(producerSendSpy.mock.calls[0][0].messages[0].value)
    expect(sentMessage.type).toBe('timer-start')
    expect(sentMessage.auctionId).toBe(mockAuctionId)
    expect(sentMessage.timer).toBe(startTime)
  })

  // Error handling
  test('should handle errors when auction service fails', async () => {
    auctionService.getPlayerAuction.mockRejectedValueOnce(new Error('Auction not found'))

    const callback = eventSource.onPlayerConnect.mock.calls[0][0]
    await callback(mockPlayerId)

    expect(producerSendSpy).not.toHaveBeenCalled()
  })

  test('should handle errors when user service fails', async () => {
    userService.getUser.mockRejectedValueOnce(new Error('User not found'))

    const callback = auctionEventsSource.onPlayerJoin.mock.calls[0][0]
    await callback(mockAuctionId, mockPlayerId)

    expect(producerSendSpy).not.toHaveBeenCalled()
  })
})
