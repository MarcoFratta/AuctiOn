import { AuctionController } from '../src/controllers/AuctionController'
import { AuctionService } from '../src/services/AuctionService'
import { WebSocketAdapter } from '../src/adapters/WebSocketAdapter'
import { AuctionConfig } from '../src/schemas/Auction'
import { mock, MockProxy } from 'jest-mock-extended'
import { ItemsMap } from '../src/schemas/Player'
import { InventoryInput } from '../src/schemas/Item'
import { AuctionServiceImpl } from '../src/services/AuctionServiceImpl'
import { NewBidMsg, NewSaleMsg } from '@auction/common/messages'
import redisMock from 'ioredis-mock'
import { UserService } from '../src/services/UserService'
import { UserServiceImpl } from '../src/services/UserServiceImpl'
import Redis from 'ioredis'

describe('AuctionController', () => {
  let controller: AuctionController
  let mockAuctionService: MockProxy<AuctionService>
  let mockWebSocketAdapter: MockProxy<WebSocketAdapter>
  let redis: Redis
  let userService: UserService

  const defaultConfig: AuctionConfig = {
    id: 'auction1',
    creatorId: 'player1',
    maxPlayers: 4,
    maxRound: 3,
    startAmount: 100,
    startInventory: { items: [{ item: 'square', quantity: 2 }] },
    bidTime: 30,
  }

  beforeEach(() => {
    mockAuctionService = mock<AuctionServiceImpl>()

    mockWebSocketAdapter = mock<WebSocketAdapter>()

    redis = new redisMock()
    userService = new UserServiceImpl(redis)
    controller = new AuctionController(mockAuctionService, mockWebSocketAdapter, mockWebSocketAdapter, userService)
  })
  afterAll(() => {
    redis.flushall()
  })

  it('should handle player connections', () => {
    const playerId = 'player1'
    mockAuctionService.setPlayerState.mockResolvedValue({
      ...defaultConfig,
      players: [{ id: playerId, status: 'connected', money: 100, inventory: new Map() }],
      sellerQueue: [],
      currentRound: 1,
    })

    controller.handlePlayerConnect(playerId)

    expect(mockAuctionService.setPlayerState).toHaveBeenCalledWith(playerId, 'connected')
  })

  it('should handle player disconnections', () => {
    const playerId = 'player1'
    mockAuctionService.setPlayerState.mockResolvedValue({
      ...defaultConfig,
      players: [{ id: playerId, status: 'not-connected', money: 100, inventory: new Map() }],
      sellerQueue: [],
      currentRound: 1,
    })

    controller.handlePlayerDisconnect(playerId)

    expect(mockAuctionService.setPlayerState).toHaveBeenCalledWith(playerId, 'not-connected')
  })

  test('should handle player bid message', async () => {
    const playerId = 'player1'
    const message: NewBidMsg = {
      type: 'bid',
      bid: {
        amount: 100,
        round: 1,
      },
    }
    const bid = { amount: 100, round: 1 }

    mockAuctionService.playerBid.mockResolvedValue({
      id: 'auction1',
      players: [],
      creatorId: 'player1',
      maxRound: 10,
      maxPlayers: 4,
      startAmount: 100,
      startInventory: { items: [{ item: 'square', quantity: 2 }] },
      bidTime: 30,
      sellerQueue: ['player1'],
      currentRound: 1,
      currentSale: undefined,
      currentBid: { ...bid, playerId: 'player1', timestamp: new Date().toISOString() },
      startTimestamp: new Date().toISOString(),
    })

    await controller.handlePlayerMessage(playerId, message)

    expect(mockAuctionService.playerBid).toHaveBeenCalledWith({
      playerId,
      amount: bid.amount,
      round: bid.round,
      timestamp: expect.any(String),
    })
  })

  test('should handle player sell message', async () => {
    const playerId = 'player1'
    const saleItems: InventoryInput = {
      items: [
        { item: 'square', quantity: 2 },
        { item: 'circle', quantity: 1 },
      ],
    }
    const message: NewSaleMsg = {
      type: 'sell',
      sale: {
        items: saleItems.items,
      },
    }

    const itemsMap: ItemsMap = new Map([
      ['square', 2],
      ['circle', 1],
    ])

    mockAuctionService.playerSale.mockResolvedValue({
      id: 'auction1',
      players: [],
      maxRound: 10,
      creatorId: 'player1',
      maxPlayers: 4,
      startAmount: 100,
      startInventory: { items: [{ item: 'square', quantity: 2 }] },
      bidTime: 30,
      sellerQueue: ['player1'],
      currentRound: 1,
      currentSale: {
        items: itemsMap,
        sellerId: 'player1',
        endTimestamp: new Date().toISOString(),
      },
      currentBid: undefined,
      startTimestamp: new Date().toISOString(),
    })

    await controller.handlePlayerMessage(playerId, message)

    expect(mockAuctionService.playerSale).toHaveBeenCalledWith({ sellerId: playerId, items: itemsMap })
  })
})
