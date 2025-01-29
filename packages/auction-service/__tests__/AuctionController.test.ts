import { AuctionController } from '../src/controllers/AuctionController'
import { AuctionService } from '../src/services/AuctionService'
import { WebSocketAdapter } from '../src/adapters/WebSocketAdapter'
import { AuctionConfig } from '../src/schemas/Auction'
import { mock, MockProxy } from 'jest-mock-extended'
import { BidMessage } from '../src/schemas/AuctionMessages'
import { ItemsMap } from '../src/schemas/Player'
import { InventoryInputMsg } from '../src/schemas/Item'
import { AuctionServiceImpl } from '../src/services/AuctionServiceImpl'

describe('AuctionController', () => {
  let controller: AuctionController
  let mockAuctionService: MockProxy<AuctionService>
  let mockWebSocketAdapter: MockProxy<WebSocketAdapter>

  const defaultConfig: AuctionConfig = {
    id: 'auction1',
    maxPlayers: 4,
    maxRound: 3,
    startAmount: 100,
    startInventory: { items: [{ item: 'square', quantity: 2 }] },
    bidTime: 30,
  }

  beforeEach(() => {
    mockAuctionService = mock<AuctionServiceImpl>()

    mockWebSocketAdapter = mock<WebSocketAdapter>()

    controller = new AuctionController(mockAuctionService, mockWebSocketAdapter, mockWebSocketAdapter)
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
    const message = JSON.stringify({
      type: 'bid',
      bid: {
        amount: 100,
        round: 1,
      },
    })
    const bid: BidMessage = { amount: 100, round: 1 }

    mockAuctionService.playerBid.mockResolvedValue({
      id: 'auction1',
      players: [],
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
    const saleItems: InventoryInputMsg = {
      items: [
        { item: 'square', quantity: 2 },
        { item: 'circle', quantity: 1 },
      ],
    }
    const message = JSON.stringify({
      type: 'sell',
      sale: {
        items: saleItems.items,
      },
    })

    const itemsMap: ItemsMap = new Map([
      ['square', 2],
      ['circle', 1],
    ])

    mockAuctionService.playerSale.mockResolvedValue({
      id: 'auction1',
      players: [],
      maxRound: 10,
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

    expect(mockAuctionService.playerSale).toHaveBeenCalledWith(playerId, itemsMap)
  })
})
